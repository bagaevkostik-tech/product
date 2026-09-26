const mysql = require('mysql2/promise')
const mainModule = require('./mainModule');
const { text } = require('pdfkit');
const { openSupply } = require('./myModule');
const myModule = require('./myModule');
const db = require('./db');


let config = {
    host: 'localhost',
    user: 'kostya',
    database: 'supplys',
    password: '9482'
}

async function saveSupply(item) {
    const data = item.main
    //  console.log(data)
    if (item.username === 'oleg') return { result: false, text: 'Недостатнє повноважень, для транзакції.' }
    try {
        config.user = item.username
        config.password = item.userpass
        const conn = await mysql.createConnection(config)
        if (data.number) {
            let result = await auditNumber(data, conn)
            if (!result) return { result: false, text: 'Номер не є унікальним!' }
        }
        // console.log(item.quickList)

        await myModule.saveQuickList(item, conn, item.username)
        if (!data.id) {
            await newSupplyId(data, conn)
            await newSupplyNumber(data, conn)
            await db.query(`INSERT INTO transactions (user,operation,document) VALUES ('${item.username}',2,${data.id}) `)
            const nameProvider = await mainModule.getCounterparty(data.provider, conn)
            const nameTransport = await mainModule.getTransport(data.transport, conn)
            const dateSupply = mainModule.formatDateUa(new Date(data.date))
            const textNewMessage = "Нове Надходження № " + data.number + " від " + dateSupply + ", Постачальник: " + nameProvider + ", Транспорт: " + nameTransport
            await myModule.sendMsg({recipient: 'oleg', text: textNewMessage, sender: item.username})
        }
        let bodySQL = ''
        bodySQL += (!data.ttn) ? ',TTN = null' : `,TTN = '${data.ttn}'`
        bodySQL += (!data.notes) ? ',Note = null' : `,Note = '${data.notes}'`
        bodySQL += (!data.provider) ? ',Provider = null' : `,Provider = ${data.provider}`
        bodySQL += (!data.carrier) ? ',Carrier = null' : `,Carrier = ${data.carrier}`
        bodySQL += (!data.transport) ? ',Transport = null' : `,Transport = ${data.transport}`

        let strSQL = `UPDATE supply SET SupplyDate = '${data.date}', num='${data.number}' ${bodySQL} WHERE id=${data.id};`
        await db.query(strSQL)
        strSQL = `DELETE FROM supplys_nomenclature WHERE supply=${data.id};`
        await db.query(strSQL)
        // console.log(item.table)
        for (let i = 0; i < item.table.length; i++) {
            let strField = ''
            let strValue = ''
            if (item.table[i].sel) {
                strField += ',nomenclature'
                strValue += `, ${item.table[i].sel}`
            }
            if (item.table[i].inp1) {
                strField += ',quantity'
                strValue += `, ${item.table[i].inp1}`
            }
            if (item.table[i].inp2) {
                strField += ',percent_provider'
                strValue += `, ${item.table[i].inp2}`
            }
            if (item.table[i].percent_lab) {
                strField += ',percent_lab'
                strValue += `, '${item.table[i].percent_lab}'`
            }
            if (item.table[i].Fat) {
                strField += ',Fat'
                strValue += `, '${item.table[i].Fat}'`
            }
            // if (data.number) {
            //     strField += ',num'
            //     strValue += `, ${data.number}`
            // }
            strSQL = `INSERT INTO supplys_nomenclature (supply_date,supply ${strField}) VALUES ('${data.date}',${data.id} ${strValue});`
            await conn.execute(strSQL)
        }
        conn.end()
        return { result: true, main: data };
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка збереження.' }
    }
}

async function supplys(params) {
    config.user = params.username
    config.password = params.userpass
    const conn = await mysql.createConnection(config) 
    const result  = await querySupplys(params, conn)
    conn.end()
    return result
}

async function querySupplys(data, conn) {
    try {
        let sort = 'DESC'
        if (data.sort) sort = ''
        const strSQL = `
SELECT DATE_FORMAT(tbl2.SupplyDate, '%d.%m.%Y') AS date,tbl2.ID AS supply,IFNULL(tbl1.Name,'') AS nomenclature
,IFNULL(tbl.quantity,'') AS quantity,tbl2.num AS number,IFNULL(tbl2.Note,'') AS note,IFNULL(percent_provider,'') AS pctProvider
,IFNULL(tbl.percent_lab,'') AS pctLAB,IFNULL(fat,'') AS fat, IFNULL(tbl3.Name, '') AS provider
,IFNULL(tbl4.Name,'') AS carrier,IFNULL(tbl5.Name,'') AS transport,IFNULL(tbl2.TTN,'') ttn
FROM supplys_nomenclature AS tbl
INNER JOIN
nomenclatures AS tbl1 ON tbl.nomenclature = tbl1.ID
right JOIN
supply AS tbl2 ON tbl.supply = tbl2.ID
LEFT JOIN
counterparties AS tbl3 ON tbl2.Provider = tbl3.ID
LEFT JOIN
counterparties AS tbl4 ON tbl2.Carrier = tbl4.ID
LEFT JOIN
transports AS tbl5 ON  tbl2.Transport = tbl5.ID
WHERE tbl2.SupplyDate BETWEEN '${data.dateStart}' AND '${data.dateFinish}'
ORDER BY tbl2.SupplyDate ${sort}, tbl2.num ${sort};
`
        const [rows, fields] = await conn.execute(strSQL)
        return {result: true, table: rows};
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Помилка завантаження.'}
    }
}

async function querySupplysList(data) {
    try {
        config.user = data.username
        config.password = data.userpass

        const conn = await mysql.createConnection(config)
        const [rows, fields] = await conn.execute(`
            SELECT supply.ID AS id,DATE_FORMAT(SupplyDate, '%d.%m.%Y') AS date, num,IFNULL(tbl1.Name,'') AS provider
            ,IFNULL(tbl2.Name,'') AS carrier,IFNULL(tbl3.Name,'') AS transport,IFNULL(ttn, '') AS ttn,IFNULL(note,"") AS note
            FROM supply 
            INNER JOIN 
            counterparties AS tbl1 ON supply.Provider = tbl1.ID
            INNER JOIN 
            counterparties AS tbl2 ON supply.Carrier = tbl2.ID
            INNER JOIN
            transports AS tbl3 ON supply.Transport = tbl3.ID
            WHERE SupplyDate BETWEEN '${data.dateStart}' AND '${data.dateFinish}'
            ORDER BY SupplyDate, supply.num;         
            `)
        conn.end()
        return {result: true, table: rows};
    } catch (error) {
        console.log('Error', error)
        return {result: false}
    }

}

async function querySupply(data) {
    try {
        config.user = data.username
        config.password = data.userpass

        const conn = await mysql.createConnection(config)
        const [main, fields] = await conn.execute(`
        SELECT id,num AS number, SupplyDate AS date, Provider,Carrier,Transport,TTN AS ttn, Note AS notes 
        FROM supply WHERE id=${data.id};
        `)
        main[0].nameProvider = (main[0].Provider !== null) ? await mainModule.getCounterparty(main[0].Provider, conn) : ''
        main[0].nameCarrier = (main[0].Carrier !== null) ? await mainModule.getCounterparty(main[0].Carrier, conn) : ''
        main[0].nameTransport = (main[0].Transport !== null) ? await mainModule.getTransport(main[0].Transport, conn) : ''
        main[0].ttn = (main[0].ttn !== null) ? main[0].ttn : ''
        if (main[0].notes === null) main[0].notes = ''
        let strSQL = `
            SELECT nomenclature AS productID,quantity AS qty
            ,IFNULL(percent_provider,'') AS pctProvider
            ,IFNULL(percent_lab,'') AS pctLAB,IFNULL(fat,'') AS fat, tbl1.Name AS productName
            FROM supplys_nomenclature AS tbl 
            INNER JOIN 
            nomenclatures AS tbl1 ON tbl.nomenclature = tbl1.ID
            WHERE supply=${data.id};
        `
        const [table, field] = await conn.execute(strSQL)
        const quickList = await mainModule.getQuickList(data.username, conn)
        const result = { result: true, main: main, table: table, quickList: quickList }
        conn.end()
        return result;
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка завантаження!' }
    }
}

async function zeroSupplyParam(data) {
    config.user = data.username
    config.password = data.userpass
    try {
        const conn = await mysql.createConnection(config)
        const quickList = await mainModule.getQuickList(data.username, conn)
        const result = {result: true, quickList: quickList}
        conn.end()
        return result;
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Помилка отримання даних!'}
    }
}

// Экспортируем функцию
module.exports = {
    saveSupply: saveSupply,
    zeroSupplyParam: zeroSupplyParam,
    querySupplysList: querySupplysList,
    querySupply: querySupply,
    supplys: supplys    
}    

async function newSupplyId(data, conn) {
    await conn.execute(`INSERT INTO supply (SupplyDate) VALUE ('${data.date}');`)
    const [rows] = await db.query(`SELECT id FROM supply ORDER BY id DESC LIMIT 1;`)
    data.id = rows[0].id
    return data;
}

async function newSupplyNumber(data, conn) {
    const dateStart = mainModule.formatDateFirstDay(new Date(data.date))
    const dateFinish = mainModule.formatDateLastDay(new Date(data.date))
    const [rows, fields] = await conn.execute(`
        SELECT num FROM supply WHERE SupplyDate BETWEEN '${dateStart}' AND '${dateFinish}' ORDER BY num DESC LIMIT 1;
        `)
    data.number = String(+rows[0].num + 1).padStart(3, '0')
    return data;
}

async function auditNumber(data, conn) {
    let result = false
    const dateStart = mainModule.formatDateFirstDay(new Date(data.date))
    const dateFinish = mainModule.formatDateLastDay(new Date(data.date))

    const strSQL = `
        SELECT id FROM supply WHERE SupplyDate BETWEEN '${dateStart}' AND '${dateFinish}' AND Num='${data.number}';
        `
    const [rows, fields] = await conn.execute(strSQL)
    if (rows.length === 0 || rows[0].id === data.id) result = true
    if (rows.length > 1) result = false
    return result;
}

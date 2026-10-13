const mainModule = require('./mainModule');
const { text } = require('pdfkit');
const myModule = require('./myModule');
const db = require('./db');
const util = require('util'); // Преобразование информации об ошибке в чисто текст


async function querySupplys(data) {
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
        const [rows] = await db.query(strSQL)
        return {result: true, table: rows};
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Помилка завантаження.'}
    }
}

async function querySupplysList(data) {
    try {
        const [rows] = await db.query(`
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
        return {result: true, table: rows};
    } catch (error) {
        console.log('Error', error)
        return {result: false}
    }

}

async function newSupply(data) {
    try {
        const CPs = await myModule.directoryCounterpaties()
        const transports = await myModule.directoryTransports()
        const products = await myModule.directoryProducts()
        const quickList = await mainModule.getQuickList(data.username)
        const result = {result: true, quickList: quickList, CPs: CPs.table, transports: transports.table, products: products.table}
        return result;
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Помилка отримання даних!'}
    }
}

async function openSupply(data) {
    try {
        const [main] = await db.query(`
SELECT id,num AS number, SupplyDate AS date, Provider,
Carrier,Transport, ifnull(TTN,'') AS ttn, ifnull(Note,'') AS notes 
FROM supply WHERE id=${data.id};
        `)
        main[0].nameProvider = (main[0].Provider !== null) ? await mainModule.getCounterparty(main[0].Provider) : ''
        main[0].nameCarrier = (main[0].Carrier !== null) ? await mainModule.getCounterparty(main[0].Carrier) : ''
        main[0].nameTransport = (main[0].Transport !== null) ? await mainModule.getTransport(main[0].Transport) : ''

        let strSQL = `
SELECT nomenclature AS productID,quantity AS qty
,IFNULL(percent_provider,'') AS pctProvider
,IFNULL(percent_lab,'') AS pctLAB,IFNULL(fat,'') AS fat, tbl1.Name AS productName
FROM supplys_nomenclature AS tbl 
INNER JOIN 
nomenclatures AS tbl1 ON tbl.nomenclature = tbl1.ID
WHERE supply= ?;
        `
        const [table] = await db.query(strSQL, [data.id])
        const quickList = await mainModule.getQuickList(data.username)
        const result = { result: true, main: main, table: table, quickList: quickList }
        return result;
    } catch (error) {
        const textError = 'Ошибка загрузки поставки:\n' + util.inspect(err, { showHidden: false, depth: null });
        saveErrorToDB(textError)
        return { result: false, text: 'Помилка завантаження!' }
    }
}

async function saveSupply(item) {
    const data = item.main
    if (item.username === 'oleg') return { result: false, text: 'Недостатнє повноважень, для транзакції.' }
    try {
        if (data.number) {
            let result = await auditNumber(data)
            if (!result) return { result: false, text: 'Номер не є унікальним!' }
        }

        await saveQuickList(item,  item.username)
        if (!data.id) {
            await newSupplyId(data)
            await newSupplyNumber(data)
            await db.query(`INSERT INTO transactions (user,operation,document) VALUES ('${item.username}',2,${data.id}) `)
            const nameProvider = await mainModule.getCounterparty(data.provider)
            const nameTransport = await mainModule.getTransport(data.transport)
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
            await db.query(strSQL)
        }
        return { result: true, main: data };
    } catch (error) {
        const textError = 'Ошибка сохранения поставки:\n' + util.inspect(err, { showHidden: false, depth: null });
        saveErrorToDB(textError)
        return { result: false, text: 'Помилка збереження.' }
    }
}


// Экспортируем функцию
module.exports = {
    querySupplysList,
    newSupply,
    openSupply,
    saveSupply,
    querySupplys
}    

async function newSupplyId(data) {
    await db.query(`INSERT INTO supply (SupplyDate) VALUE ('${data.date}');`)
    const [rows] = await db.query(`SELECT id FROM supply ORDER BY id DESC LIMIT 1;`)
    data.id = rows[0].id
    return data;
}

async function newSupplyNumber(data) {
    const dateStart = mainModule.formatDateFirstDay(new Date(data.date))
    const dateFinish = mainModule.formatDateLastDay(new Date(data.date))
    const [rows] = await db.query(`
        SELECT num FROM supply WHERE SupplyDate BETWEEN '${dateStart}' AND '${dateFinish}' ORDER BY num DESC LIMIT 1;
        `)
    data.number = String(+rows[0].num + 1).padStart(3, '0')
    return data;
}

async function auditNumber(data) {
    let result = false
    const dateStart = mainModule.formatDateFirstDay(new Date(data.date))
    const dateFinish = mainModule.formatDateLastDay(new Date(data.date))

    const strSQL = `
        SELECT id FROM supply WHERE SupplyDate BETWEEN '${dateStart}' AND '${dateFinish}' AND Num='${data.number}';
        `
    const [rows] = await db.query(strSQL)
    if (rows.length === 0 || rows[0].id === data.id) result = true
    if (rows.length > 1) result = false
    return result;
}

async function saveQuickList(item, username) {
    const data = item.quickList
    const arrProvider = item.arrQuickProviders
    await db.query(`DELETE FROM quick_list WHERE id_user='${username}';`)
    let p = 1
    let c = 1
    let t = 1
    let n = 1
    for (i = 0; i < data.length; i++) {
        if (data[i].type === 'Provider' && p <= 7) {
            await db.query(`INSERT INTO quick_list (id_user,name_type,num,id_value) VALUES ('${username}','Provider',${p},${data[i].id});`)
            p++
        }
        if (data[i].type === 'Carrier' && c <= 7) {
            await db.query(`INSERT INTO quick_list (id_user,name_type,num,id_value) VALUES ('${username}','Carrier',${c},${data[i].id});`)
            c++
        }
        if (data[i].type === 'Transport' && t <= 7) {
            await db.query(`INSERT INTO quick_list (id_user,name_type,num,id_value) 
                VALUES ('${username}','Transport',${t},${data[i].id});`)
            t++
        }
        if(data[i].type === 'Nomenclature' && n <= 7) {
            await db.query(`INSERT INTO quick_list (id_user,name_type,num,id_value) VALUES ('${username}','Nomenclature',${n},${data[i].id});`)
            n ++
        }
    }
}

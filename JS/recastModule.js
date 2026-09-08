const mysql = require('mysql2/promise')
const mainModule = require('./mainModule');
const { text } = require('pdfkit');


let config = {
    host: 'localhost',
    user: 'kostya',
    database: 'supplys',
    password: '9482'
}

async function queryRecast(data) {
    try {
        config.user = data.username
        config.password = data.userpass

        let sort = 'DESC'
        if (data.sort) sort = ''
        const conn = await mysql.createConnection(config)
        const dateStart = data.dateStart
        const dateFinish = data.dateFinish
        const [rows, fields] = await conn.execute(`
SELECT tbl.ID id,ifnull(tbl.Num,'') AS number,DATE_FORMAT(tbl.conversionDate, '%d.%m.%Y') AS date,ifnull(tbl1.Supply,'') Supply
,ifnull(tbl2.Name,'') AS product,ifnull(tbl1.percent_lab,'') AS percentLAB
,ifnull(RecastFat,'') AS fat,ifnull(tbl1.RecastAcid,'') AS acid
,IFNULL(tbl1.RecastSodium,'') AS sodium,IFNULL(tbl1.RecastFoamy,'') AS foamy
,IFNULL(tbl4.Name,'') provider, IFNULL(tbl5.Name, '') transport
FROM conversion tbl
LEFT JOIN recasts tbl1
ON tbl.ID = tbl1.Conversion
LEFT join nomenclatures as tbl2
ON tbl2.id = tbl1.Nomenclature
LEFT JOIN supply tbl3
ON tbl3.ID = tbl1.Supply
LEFT JOIN counterparties tbl4
ON tbl4.ID = tbl3.Provider
LEFT JOIN transports tbl5
ON tbl5.ID = tbl3.Transport

WHERE tbl.conversionDate BETWEEN '${dateStart}' AND '${dateFinish}'
ORDER BY tbl.conversionDate ${sort}, tbl.Num ${sort};
    `)
        conn.end()
        result = rows
        return result;
    } catch (error) {
        console.log('Error', error)
        return false
    }
}

async function queryRecastsList (data) {
    try {
        config.user = data.username
        config.password = data.userpass

        const conn = await mysql.createConnection(config)
        const [rows, fields] = await conn.execute(`
            SELECT id,DATE_FORMAT(conversionDate, '%d.%m.%Y') AS date, IFNULL(num,'') AS num
            FROM conversion
            WHERE conversionDate BETWEEN '${data.dateStart}' AND '${data.dateFinish}'
            ORDER BY conversionDate, num; 
        `)
        const strSQL = `
SELECT tbl1.Name AS productName,tbl.Conversion AS conversID,tbl2.quantity AS qty
,IFNULL(tbl2.percent_provider,'') AS pctProvider, tbl.percent_lab AS pctLAB, tbl.RecastFat AS fat
,IFNULL(tbl.RecastAcid,0) AS acid,IFNULL(tbl.RecastSodium,0) AS sodium, IFNULL(tbl.RecastFoamy,0) AS foamy
,tbl3.num AS num,DATE_FORMAT(tbl3.SupplyDate, '%d.%m.%Y') AS date
FROM recasts AS tbl
INNER JOIN 
nomenclatures AS tbl1 ON tbl.Nomenclature = tbl1.ID
INNER JOIN
supplys_nomenclature AS tbl2 ON tbl.supply = tbl2.supply AND tbl.Nomenclature = tbl2.nomenclature AND tbl.RecastFat = tbl2.Fat
INNER JOIN
supply AS tbl3 ON tbl2.supply = tbl3.ID
WHERE
tbl.Conversion IN 
(SELECT id FROM conversion WHERE conversionDate BETWEEN '${data.dateStart}' AND '${data.dateFinish}');        
        `
        const [recasts, field] = await conn.execute(strSQL)
        conn.end()
        return {result: true, table: rows, recasts: recasts}
    } catch (error) {
        console.log('Error', error)
        return {result:  false}
    }
}

async function sopplysForRecast (data) {
    try {
        config.user = data.username
        config.password = data.userpass

        const conn = await mysql.createConnection(config)
        const dateStart = data.dateStart
        const dateFinish = data.dateFinish
        let val = ''
        if (data.supplysAll === false) val = `AND supply NOT IN (SELECT Supply FROM recasts WHERE supply = supply.id
        AND RecastFat = supplys_nomenclature.Fat AND recasts.Nomenclature = supplys_nomenclature.nomenclature
        )`
        const [rows, fields] = await conn.execute(`
            SELECT Provider AS providerID, supplys_nomenclature.nomenclature AS productID, quantity AS qty,
            supply.num AS supplyNum, SupplyDate as date, percent_provider AS pctProvider, supply.id as supplyID,
            percent_lab AS pctLAB, Transport AS transportID, supplys_nomenclature.Fat AS fat  
            FROM supplys_nomenclature, supply 
            WHERE supply_date BETWEEN '${dateStart}' AND '${dateFinish}' AND supplys_nomenclature.supply = supply.id
            ${val}
            ORDER BY SupplyDate, supply.num;    
            `)
        
        if (rows.length !== 0) {
            rows.forEach(obj => {
                obj.providerName = ''; // Добавляем новое свойство (столбец)
                obj.transportName = ''; // Добавляем новое свойство (столбец)
                obj.productName = ''; // Добавляем новое свойство (столбец)
            });
            for (let i = 0; i < rows.length; i++) {
                rows[i].date = mainModule.formatDateUa(rows[i].date)
                if (rows[i].providerID) {rows[i].providerName = await mainModule.getCounterparty(rows[i].providerID, conn)}
                else {rows[i].providerName = ''}
                if (rows[i].transportID) rows[i].transportName = await mainModule.getTransport(rows[i].transportID, conn)
                    else {rows[i].transportName = ''}
                if (rows[i].productID) rows[i].productName = await mainModule.getNomenclature(rows[i].productID, conn)
                if (!rows[i].pctProvider) rows[i].pctProvider = ''
                if (!rows[i].pctLAB) rows[i].pctLAB = ''
                if (!rows[i].fat) rows[i].fat = ''
            }
        }
        
        const result = rows
        conn.end()
        // console.log(result)
        return result;
    } catch (error) {
        console.log('Error', error)
        return false
    }
}

async function saveLAB (data) {
    try {
        config.user = data.username
        config.password = data.userpass

        const conn = await mysql.createConnection(config)
        const [rows, fields] = await conn.execute(`
                UPDATE supplys_nomenclature SET percent_lab='${data.pctLAB}', Fat=${data.fat} 
                WHERE supply=${data.supplyID} AND nomenclature=${data.productID} AND quantity=${data.qty} ;
        `)
        conn.end()
        delete data.username
        delete data.userpass
        // console.log(data)
        return data
    } catch (error) {
        console.log('Error', error)
        return false
    }
}

async function auditSupplys (data) {
    try {
        config.user = data.username
        config.password = data.userpass

        const conn = await mysql.createConnection(config)
        const [rows, fields] = await conn.execute(`
            SELECT supply AS supplyID, Nomenclature AS productID, RecastFat AS fat FROM recasts WHERE supply= ${data.supplyID};
        `)
        conn.end()
        return rows
    } catch (error) {
        console.log('Error', error)
        return false
    }
}

async function saveConversion  (data) {
    const table = data.table
    //  console.log(data)
    if (data.username === 'oksana') return { result: false, text: 'Недостатнє повноважень, для транзакції.' }
    try {
        config.user = data.username
        config.password = data.userpass

        const conn = await mysql.createConnection(config)
        if (data.number) {
            let result = await auditNumber(data, conn)
            if (!result) return { result: false, text: 'Номер помилковий!' }
        }

        if (!data.id) {
            await newRecastId(data, conn)
            await newRecastNumber(data, conn)
            conn.execute(`INSERT INTO transactions (user,operation,document) VALUES ('${data.username}',3,${data.id}) `)
            const dateConversion = mainModule.formatDateUa(new Date(data.date))
            const textNewMessage = "Нова Переробка № " + data.number + " від " + dateConversion 
            // console.log(textNewMessage)
            conn.execute(`INSERT INTO messages (recipient, TEXT, sender) VALUES ('oksana', '${textNewMessage}', '${data.username}')`)
        }
        let strSQL = `UPDATE conversion SET conversionDate = '${data.date}', num='${data.number}'  WHERE id=${data.id};`
        await conn.execute(strSQL)
    
        strSQL = `DELETE FROM recasts WHERE Conversion=${data.id};`
        await conn.execute(strSQL)
        for (let i = 0; i < table.length; i++) {
            let strField = ''
            let strValue = ''
            if (table[i].supplyID) {
                strField += ',Supply'
                strValue += `, ${table[i].supplyID}`
            }
            if (table[i].productID) {
                strField += ',Nomenclature'
                strValue += `, ${table[i].productID}`
            }
            if (table[i].pctLAB) {
                strField += ',percent_lab'
                strValue += `, '${table[i].pctLAB}'`
            }
            if (table[i].fat) {
                strField += ',RecastFat'
                strValue += `, ${table[i].fat}`
            }
            if (table[i].acid) {
                strField += ',RecastAcid'
                strValue += `, '${table[i].acid}'`
            }
            if (table[i].sodium) {
                strField += ',RecastSodium'
                strValue += `, '${table[i].sodium}'`
            }
            if (table[i].foamy) {
                strField += ',RecastFoamy'
                strValue += `, '${table[i].foamy}'`
            }
            // strSQL = `INSERT INTO recasts (RecastDate,Conversion ${strField}) VALUES ('${data.date}',${data.id} ${strValue});`
            strSQL = `INSERT INTO recasts (Conversion ${strField}) VALUES (${data.id} ${strValue});`
            // console.log(strSQL)
            await conn.execute(strSQL)
        }
    
        conn.end()
        delete data.username
        delete data.userpass
        delete data.table
        data.result = true
        return data
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Помилка завантаження!', error}
    }
}

async function deleteRowRecast (data) {
    const table = data.table
    //  console.log(data)
    if (data.username === 'oksana') return { result: false, text: 'Недостатнє повноважень, для транзакції.' }
    try {
        config.user = data.username
        config.password = data.userpass

        const conn = await mysql.createConnection(config)
    
        strSQL = `DELETE FROM recasts WHERE Conversion=${data.conversionID} AND Nomenclature=${data.productID} AND RecastFat='${data.fat}';`
        await conn.execute(strSQL)
    
        conn.end()
        delete data.username
        delete data.userpass
        delete data.table
        data.result = true
        // data.text = 'Запис видалено.'
        return data
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Помилка видалення запису!', error}
    }
}

async function openRecast(data) {
    try {
        config.user = data.username
        config.password = data.userpass

        const conn = await mysql.createConnection(config)

        let strSQL = `SELECT conversionDate AS date,Num AS num FROM conversion WHERE ID = ${data.id};`
        const [main, fields] = await conn.execute(strSQL)

        strSQL = `
            SELECT counterparties.Name AS providerName,transports.Name AS transportName,supply.ID AS supplyID,SupplyDate AS date,supply.num AS supplyNum 
            ,recasts.Nomenclature AS productID,nomenclatures.Name AS productName,recasts.percent_lab AS pctLAB, supplys_nomenclature.percent_provider AS pctProvider
            , supplys_nomenclature.quantity AS qty,recasts.RecastFat AS fat,recasts.RecastAcid AS inAcid, recasts.RecastSodium AS inSodium, recasts.RecastFoamy AS inFoamy
            FROM supply 
            INNER JOIN 
            recasts ON supply.ID = recasts.Supply
            INNER JOIN 
            supplys_nomenclature ON recasts.Supply = supplys_nomenclature.supply 
            AND recasts.Nomenclature = supplys_nomenclature.nomenclature AND recasts.RecastFat = supplys_nomenclature.Fat
            INNER JOIN 
            transports ON supply.Transport = transports.ID
            INNER JOIN 
            counterparties ON supply.Provider = counterparties.ID
            INNER JOIN 
            nomenclatures ON recasts.Nomenclature = nomenclatures.ID
            WHERE Conversion = ${data.id}
            ORDER BY SupplyDate, supply.num; 
            `
        let [tblRecasts, field] = await conn.execute(strSQL)
        for (i = 0; i < tblRecasts.length; i ++) {
            tblRecasts[i].date = mainModule.formatDateUa(tblRecasts[i].date)
        }

        strSQL = `
            SELECT supply.id AS supplyID, supply.SupplyDate AS date, supply.num AS supplyNum, nomenclatures.Name AS productName, supplys_nomenclature.nomenclature AS productID 
            ,supplys_nomenclature.quantity AS qty,supplys_nomenclature.percent_provider AS pctProvider,supplys_nomenclature.percent_lab AS pctLAB
            ,IFNULL(supplys_nomenclature.Fat, 0) AS fat
            FROM supplys_nomenclature
            INNER JOIN 
            supply ON supply.ID = supplys_nomenclature.supply
            INNER JOIN 
            nomenclatures ON nomenclatures.ID = supplys_nomenclature.nomenclature
            WHERE 
            supplys_nomenclature.supply IN 
            (SELECT supply FROM recasts WHERE conversion = ${data.id})
            ORDER BY SupplyDate, supply.num; 
        `
        let [tblLAB, fiel] = await conn.execute(strSQL)
        for (i = 0; i < tblLAB.length; i ++) {
            tblLAB[i].date = mainModule.formatDateUa(tblLAB[i].date)
        }
        // console.log(tblRecasts)
        conn.end()
        const result = {
            result: true,
            date: main[0].date,
            num: main[0].num,
            tblRecasts: tblRecasts,
            tblLAB: tblLAB 
        }
        return result
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка завантаження!'}
    }
}
async function reqSamples(conn) {
    const [rows, fields] = await conn.execute(`
        SELECT id, name, acid, sodium, foamy FROM sample;
    `)
    return rows
}

async function getSamples(data) {
    config.user = data.username
    config.password = data.userpass
    try {
        const conn = await mysql.createConnection(config)
        const table = await reqSamples(conn)
        conn.end()
        return {result: true, table: table};
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Помилка отримання даних.'}
    }
}

async function removeSample (data) {
    if (data.username === 'oksana') return { result: false, text: 'Недостатнє повноважень, для транзакції.' }
    config.user = data.username
    config.password = data.userpass
    try {
        const conn = await mysql.createConnection(config)
        const strSQL = `DELETE FROM sample WHERE id = ${data.id};`
        await conn.execute(strSQL)

        const table = await reqSamples(conn)
        const result = {result: true, table: table}
        conn.end()
        return result;
    } catch (error) {
        console.log('Error', error)
        return false
    }
}

async function saveSample(data) {
//    console.log(data)    
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)
        if (!data.id) {
            await conn.execute(`INSERT INTO sample (name) VALUE ('${data.name}');`)
            const [row, fields] = await conn.execute('SELECT id FROM sample ORDER BY id DESC LIMIT 1;')
            data.id = row[0].id
        }
        await conn.execute(`UPDATE sample SET name='${data.name}', acid = ${data.acid}, sodium = ${data.sodium}, foamy = ${data.foamy} WHERE id=${data.id};`)
        const table = await reqSamples(conn)

        conn.end()
        data.result = true
        return {result: true,id: data.id, table: table}
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка збереження.' }
    }
}

// Экспортируем функцию
module.exports = {
    queryRecast: queryRecast,
    sopplysForRecast: sopplysForRecast,
    saveLAB: saveLAB,
    auditSupplys: auditSupplys,
    saveConversion: saveConversion,
    deleteRowRecast: deleteRowRecast,
    openRecast: openRecast,
    queryRecastsList: queryRecastsList,
    getSamples: getSamples,
    removeSample: removeSample,
    saveSample: saveSample
};

async function newRecastId(data, conn) {
    await conn.execute(`INSERT INTO conversion (conversionDate) VALUE ('${data.date}');`)
    const [rows, fields] = await conn.execute(`SELECT id FROM conversion ORDER BY id DESC LIMIT 1;`)
    
    data.id = rows[0].id
    return data;
}

async function newRecastNumber(data, conn) {
    const now = new Date(data.date);
    const dateStart = `${now.getFullYear()}-01-01`;
    const dateFinish = mainModule.formatDateLastDay(new Date(data.date))
    const [rows, fields] = await conn.execute(`
        SELECT num FROM conversion WHERE conversionDate BETWEEN '${dateStart}' AND '${dateFinish}' ORDER BY num DESC LIMIT 1;
        `)
    if (!rows[[0]].num) {
        data.number = '001/' + mainModule.numberMM(new Date(data.date))
        return data
    } else {
    // Разделяем строку по /
    const parts = rows[[0]].num.split('/');
    // parts[0] - номер, parts[1] - месяц
    data.number = String(+parts[0] + 1).padStart(3, '0') + '/' + parts[1]
    }
    // console.log(dateStart, dateFinish, rows[0].num)
    return data;
}

async function auditNumber(data, conn) {
    let result = false

    if (data.number.includes("/")) {
        // Разделяем строку по /
        const parts = data.number.split('/');
        // parts[0] - номер, parts[1] - месяц
        let val = parts[0];
        let isNum = +val === +val && val !== ''; // true, если строка конвертируется в число 
        if (!isNum) return result

    }
    
    //Проверка на уникальноть
    const dateStart = mainModule.formatDateFirstDay(new Date(data.date))
    const dateFinish = mainModule.formatDateLastDay(new Date(data.date))

    const strSQL = `
        SELECT id FROM conversion WHERE conversionDate BETWEEN '${dateStart}' AND '${dateFinish}' AND Num='${data.number}';
        `
    const [rows, fields] = await conn.execute(strSQL)
    if (rows.length === 0 || rows[0].id === data.id) result = true
    if (rows.length > 1) result = false
    return result;
}

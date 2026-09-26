const { text } = require('body-parser');
const mysql = require('mysql2/promise')
const mainModule = require('./mainModule');
const { name } = require('xlsx-populate/lib/RichTextFragment');
const db = require('./db');
const socketStorage = require('./socket');

let config = {
    host: 'localhost',
    user: 'kostya',
    database: 'supplys',
    password: '9482'
}

async function zeroRecastParam(data) {
    config.user = data.username
    config.password = data.userpass
    try {
        const conn = await mysql.createConnection(config)

        const [rows, fields] = await conn.execute(`
            SELECT id, name, acid, sodium, foamy FROM sample;
    `)
        const result = rows
        conn.end()
        return result;
    } catch (error) {
        console.log('Error', error)
        return false
    }
}

async function directoryCounterpaties(data) {
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)
        const table = await reqDirectoryCounterpaties(conn)
        
        conn.end()
        if (table) {
            return {result: true, table: table};
        } else { return {result: false, text: 'Помилка запиту до бази даних.'}}
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Помилка завантаження.'}
    }
}

async function reqDirectoryCounterpaties(conn) {
    try {
        const [rows, fields] = await conn.execute(`
            SELECT id,name,IFNULL(FullName,'') AS fullName,IFNULL(OKPO,'') AS OKPO,IFNULL( Address, '') AS address
            ,IFNULL(Telefon, '') AS telefon,type,ifnull(id_bas,'') AS id_bas   FROM counterparties ORDER BY NAME;
    `)
        return rows;
    } catch (error) {
        console.log('Error', error)
        return false
    }
}

async function directoryTransports(data) {
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)

        const table = await reqDirectoryTransports(conn)
        conn.end()
        if (table) {
            return {result: true, table: table};
        } else { return {result: false, text: 'Помилка запиту до бази даних.'}}
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Помилка завантаження.'}
    }
}

async function reqDirectoryTransports(conn) {
    try {
        const [rows, fields] = await conn.execute(`
SELECT id,name,IFNULL(TractorName,'') AS tractorName,IFNULL(trailerName,'')AS trailerName,IFNULL(TractorModel,'')AS tractorModel
,IFNULL(tractorWeight,'')AS tractorWeight,IFNULL(tractorWeightFull,'')AS tractorWeightFull,IFNULL(tractorSize,'')AS tractorSize
,IFNULL(trailerModel,'')AS trailerModel,IFNULL(trailerWeight,'')AS trailerWeight,IFNULL(trailerWeightFull,'')AS trailerWeightFull
,IFNULL(trailerSize,'')AS trailerSize,IFNULL(driver,'')AS driver,IFNULL(driverLicense,'')AS driverLicense,IFNULL(id_bas,'')AS id_bas
 FROM transports ORDER BY NAME;
             `)
 
        return rows;
    } catch (error) {
        console.log('Error', error)
        return false
    }
}

async function directoryProducts(data) {
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)
        const table = await reqDirectoryProducts(conn)
        conn.end()
        if (table) {
            return {result: true, table: table}
        } else { return {result: false, text: 'Помилка запиту до бази даних.'}}
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Пимилка завантаження.'}
    }
}

async function reqDirectoryProducts(conn) {
    try {
        const [rows, fields] = await conn.execute(`
            SELECT id, name, ifnull(FullName,'') AS fullName,IFNULL(number_BAS,'') AS id_bas FROM nomenclatures ORDER BY NAME;
            `)
        return rows;
    } catch (error) {
        console.log('Error', error)
        return false
    }
}

async function getSupplyData(s, conn) {
    const [rows, fields] = await conn.execute(`SELECT * FROM supply WHERE id = ${s};`)
    return (rows) ? rows : ''
}

async function getNomenclature(n, conn) {
    const [rows, fields] = await conn.execute(`SELECT name FROM nomenclatures WHERE id = ${n};`)
    return (rows[0]) ? rows[0].name : ''
}

async function saveQuickList(item, conn, username) {
    const data = item.quickList
    const arrProvider = item.arrQuickProviders
    await conn.execute(`DELETE FROM quick_list WHERE id_user='${username}';`)
    let p = 1
    let c = 1
    let t = 1
    let n = 1
    // arrProvider.forEach(el => {
    //     await conn.execute(`INSERT INTO quick_list (id_user,name_type,num,id_value) VALUES ('${username}','Provider',${p},${el.value});`)
    //     p++
    // })
    for (i = 0; i < data.length; i++) {
        if (data[i].type === 'Provider' && p <= 7) {
            await conn.execute(`INSERT INTO quick_list (id_user,name_type,num,id_value) VALUES ('${username}','Provider',${p},${data[i].id});`)
            p++
        }
        if (data[i].type === 'Carrier' && c <= 7) {
            await conn.execute(`INSERT INTO quick_list (id_user,name_type,num,id_value) VALUES ('${username}','Carrier',${c},${data[i].id});`)
            c++
        }
        if (data[i].type === 'Transport' && t <= 7) {
            await conn.execute(`INSERT INTO quick_list (id_user,name_type,num,id_value) 
                VALUES ('${username}','Transport',${t},${data[i].id});`)
            t++
        }
        if(data[i].type === 'Nomenclature' && n <= 7) {
            await conn.execute(`INSERT INTO quick_list (id_user,name_type,num,id_value) VALUES ('${username}','Nomenclature',${n},${data[i].id});`)
            n ++
        }
    }
}

async function saveCounterparty(item) {
    const data = item.table
    // console.log(data)
    try {
        config.user = item.username
        config.password = item.userpass
        const conn = await mysql.createConnection(config)
        if (!data.id) {
            await conn.execute(`INSERT INTO counterparties (NAME) VALUE ('${data.name}');`)
            const [row, fields] = await conn.execute('SELECT id FROM counterparties ORDER BY id DESC LIMIT 1;')
            data.id = row[0].id
        }
        let val = ''

        if (data.fullName) { val += `,FullName = '${data.fullName}'` } else { val += ',FullName = null' }
        if (data.OKPO) val += `,OKPO = '${data.OKPO}'`
        if (data.address) val += `,Address = '${data.address}'`
        if (data.telefon) val += `,Telefon = '${data.telefon}'`
        if (data.id_bas) val += `,id_bas = '${data.id_bas}'`
        if (data.type) val += `,Type = '${data.type}'`

        const strSQL = `UPDATE counterparties SET NAME='${data.name}' ${val} WHERE id=${data.id};`
        await conn.execute(strSQL)

        const table = await reqDirectoryCounterpaties(conn)
        conn.end()
        data.table = table
        data.result = true
        if (table) {
            data.table = table
            data.result = true
            return data
        } else {return {result: false, text: 'Помилка запиту до бази даних.'}}
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка збереження.' }
    }

}

async function openCounterparty(data) {
    // console.log(data)
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)
        if (!data.id) return
        const [rows, fields] = await conn.execute(`
            SELECT id,name,fullName,OKPO,address,telefon,type FROM counterparties WHERE id=${data.id};
            `)
        conn.end()
        if (!rows[0].id) return { result: false, text: 'Помилка завантаження.' }
        rows[0].result = true
        if (rows[0].fullName === null) rows[0].fullName = ''
        if (rows[0].OKPO === null) rows[0].OKPO = ''
        if (rows[0].address === null) rows[0].address = ''
        if (rows[0].telefon === null) rows[0].telefon = ''
        return rows[0]
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка завантаження.' }
    }

}

async function saveTransport(item) {
    const data = item.table
    // console.log(data)
    try {
        config.user = item.username
        config.password = item.userpass
        const conn = await mysql.createConnection(config)
        if (!data.id) {
            await conn.execute(`INSERT INTO transports (NAME) VALUE ('${data.name}');`)
            const [row, fields] = await conn.execute('SELECT id FROM transports ORDER BY id DESC LIMIT 1;')
            data.id = row[0].id
        }
        let val = ''

        if (data.tractorName) val += `,tractorName = '${data.tractorName}'`
        if (data.tractorModel) val += `,tractorModel = '${data.tractorModel}'`
        if (data.tractorWeight) val += `,tractorWeight = '${data.tractorWeight}'`
        if (data.tractorWeightFull) val += `,tractorWeightFull = '${data.tractorWeightFull}'`
        if (data.tractorSize) val += `,tractorSize = '${data.tractorSize}'`
        if (data.trailerName) val += `,trailerName = '${data.trailerName}'`
        if (data.trailerModel) val += `,trailerModel = '${data.trailerModel}'`
        if (data.trailerWeight) val += `,trailerWeight = '${data.trailerWeight}'`
        if (data.trailerWeightFull) val += `,trailerWeightFull = '${data.trailerWeightFull}'`
        if (data.trailerSize) val += `,trailerSize = '${data.trailerSize}'`
        if (data.driver) val += `,driver = '${data.driver}'`
        if (data.driverLicense) val += `,driverLicense = '${data.driverLicense}'`
        if (data.id_bas) val += `,id_bas = '${data.id_bas}'`

        await conn.execute(`UPDATE transports SET NAME='${data.name}' ${val} WHERE id=${data.id};`)

        const table = await reqDirectoryTransports(conn)
        conn.end()
        if (table) {
            data.table = table
            data.result = true
            return data
        } else {return {result: false, text: 'Помилка запиту до бази даних.'}}
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка збереження.' }
    }

}

async function saveProduct(item) {
    const data = item.table
    // console.log(data)
    try {
        config.user = item.username
        config.password = item.userpass
        const conn = await mysql.createConnection(config)
        if (!data.id) {
            await conn.execute(`INSERT INTO nomenclatures (NAME) VALUE ('${data.name}');`)
            const [row, fields] = await conn.execute('SELECT id FROM nomenclatures ORDER BY id DESC LIMIT 1;')
            data.id = row[0].id
        }
        let val = ''

        if (data.fullName) val += `,fullName = '${data.fullName}'`
        if (data.id_bas) val += `,number_BAS = '${data.id_bas}'`

        await conn.execute(`UPDATE nomenclatures SET NAME='${data.name}' ${val} WHERE id=${data.id};`)
        const table = await reqDirectoryProducts(conn)
        conn.end()
        data.table = table
        data.result = true
        return data
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка збереження.' }
    }

}

async function openTransport(data) {
    // console.log(data)
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)
        if (!data.id) return
        const [rows, fields] = await conn.execute(`
            SELECT id,name,TractorName,TractorModel,TractorWeight,TractorWeightFull,TractorSize,
            TrailerName,TrailerModel,TrailerWeight,TrailerWeightFull,TrailerSize,Driver,DriverLicense FROM transports WHERE id=${data.id};
            `)

        if (rows.length !== 0) {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].TractorName === null) rows[i].TractorName = ''
                if (rows[i].TractorModel === null) rows[i].TractorModel = ''
                if (rows[i].TractorWeight === null) rows[i].TractorWeight = ''
                if (rows[i].TractorWeightFull === null) rows[i].TractorWeightFull = ''
                if (rows[i].TractorSize === null) rows[i].TractorSize = ''
                if (rows[i].TrailerName === null) rows[i].TrailerName = ''
                if (rows[i].TrailerModel === null) rows[i].TrailerModel = ''
                if (rows[i].TrailerWeight === null) rows[i].TrailerWeight = ''
                if (rows[i].TrailerWeightFull === null) rows[i].TrailerWeightFull = ''
                if (rows[i].TrailerSize === null) rows[i].TrailerSize = ''
                if (rows[i].Driver === null) rows[i].Driver = ''
                if (rows[i].DriverLicense === null) rows[i].DriverLicense = ''
            }
        }
        conn.end()
        rows[0].result = true
        return rows[0]
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка завантаження.' }
    }

}

async function reqUser(data) {
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)
        const strSQL = `
            SELECT name FROM users WHERE id= "${data.username}";
        `
        const [rows, fields] = await conn.execute(strSQL)
        conn.end()
        const result = {result: true, name: rows[0].name}
        return result
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка отримання даних.' }
    }
    
}

async function initializationAccounting(data) {
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)

        const products = await reqDirectoryProducts(conn)
        const transports = await reqDirectoryTransports(conn)
        const counterparties = await reqDirectoryCounterpaties(conn)

        conn.end()
        if (products && transports && counterparties) {
            return {result: true, products: products, transports: transports,
                 counterparties: counterparties}
        } else {return { result: false, text: 'Помилка отримання даних.' }}
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка завантаження.' }
    }
}

async function turnoverBalance(data) {
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)
        const turnover = await reqTurnover(data,conn)
        const balance = await reqTurnoverBalance(data,conn)
        conn.end()
        if (turnover && balance) {
            return {result: true, turnover: turnover, balance: balance}
        } else {return { result: false, text: 'Помилка отримання даних.' }}
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка завантаження.' }
    }
}

async function deleteDirectoryItemCounterparty(data) {
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)

        let directory 
        let strSQL
        if (data.directory === 'counterparties') {
            strSQL = `
SELECT tbl.ID id,IFNULL(tbl.num,'') number, DATE_FORMAT(tbl.SupplyDate, '%d.%m.%Y') AS date
FROM supply as tbl
WHERE tbl.Provider = ${data.id} OR tbl.Carrier = ${data.id} 
ORDER BY tbl.SupplyDate, tbl.num;        
            `
            directory = 'counterparties'
        } else if (data.directory === 'transports') {
            strSQL = `
SELECT tbl.ID id,IFNULL(tbl.num,'') number, DATE_FORMAT(tbl.SupplyDate, '%d.%m.%Y') AS date
FROM supply as tbl
WHERE tbl.Transport = ${data.id} 
ORDER BY tbl.SupplyDate, tbl.num;             
            `
            directory = 'transports'
        } else if (data.directory === 'products') {
            strSQL = `
SELECT tbl.ID id,IFNULL(tbl.num,'') number, DATE_FORMAT(tbl.SupplyDate, '%d.%m.%Y') AS date
fROM supplys_nomenclature as tbl1
INNER JOIN 
supply tbl ON tbl1.supply = tbl.ID
WHERE tbl1.nomenclature = ${data.id}
ORDER BY tbl.SupplyDate, tbl.num;             
            `
            directory = 'nomenclatures'
        } else {
            return {result: false, text: 'Помилка визначення об’єкта видалення.'}
        }
        const [rows, fields]= await conn.execute(strSQL)
        if (rows.length === 0) {
            await conn.execute(`DELETE FROM ${directory} WHERE id = ${data.id};`)
            switch(data.directory) {
                case 'counterparties':
                    table = await reqDirectoryCounterpaties(conn)
                    break
                case 'transports':
                    table = await reqDirectoryTransports(conn)
                    break
                case 'products':
                    table = await reqDirectoryProducts(conn)
                    break
                default:
                    return
            }
            return {result: true, table: table}
        } else {
            conn.end()
            return { result: false, listRow: rows, text: 'Існують пов’язані записи.', id:data.id }
        }
    } catch (error) {
        console.log('Error', error)
        return { result: false, text: 'Помилка обробки запиту.' }
    }
}

async function saveErrorToDB(data) {
    // console.log(data)
    const conn = await mysql.createConnection(config)

    const sql = 'INSERT INTO messages (recipient, TEXT, sender) VALUES (?, ?, ?)';
    try {
        await conn.execute(sql, ['kostya', data, 'admin']);
        conn.end()
        console.log('Ошибка успешно сохранена в базу данных');
    } catch (error) {
        console.error('Не удалось сохранить ошибку в БД:', error.message);
    }
}

async function sendMsg(data) {
    const sql = 'INSERT INTO messages (recipient, TEXT, sender) VALUES (?, ?, ?)';
    // const sql2 = 'SELECT * FROM messages WHERE recipient = ? AND TEXT = ? AND sender = ? ORDER BY time_creation DESC'
    try {
        await db.query(sql, [data.recipient, data.text, data.sender]);
        const io = socketStorage.getIO();
        // const [rows] = await db.query(sql2, [data.recipient, data.text, data.sender])
        io.to(data.recipient).emit('received_message', data);
        // io.to(data.sender).emit('received_message', rows[0] );
        
        console.log('Успешно сохранено сообщение в базу данных');
    } catch (error) {
        console.error('Не удалось сообщение!');
    }
}


// Экспортируем функцию
module.exports = {
    zeroRecastParam: zeroRecastParam,
    directoryCounterpaties: directoryCounterpaties,
    directoryTransports: directoryTransports,
    directoryProducts: directoryProducts,
    saveCounterparty: saveCounterparty,
    openCounterparty: openCounterparty,
    saveTransport: saveTransport,
    saveProduct: saveProduct,
    openTransport: openTransport,
    reqUser: reqUser,
    saveQuickList: saveQuickList,
    initializationAccounting: initializationAccounting,
    turnoverBalance: turnoverBalance,
    deleteDirectoryItemCounterparty: deleteDirectoryItemCounterparty,
    saveErrorToDB,
    sendMsg
};


async function reqTurnover(data, conn) {
    try {
        const strSQL = `
SELECT tbl.document AS document,qty,DATE_FORMAT(tbl.date, '%d.%m.%Y %H:%i:%s') AS date
FROM turnover AS tbl
WHERE tbl.date BETWEEN '${data.dateStart}' AND '${data.dateFinish}' 
AND tbl.product_id= ${data.productID}
ORDER BY tbl.date;  
        `
        const [rows, fields]= await conn.execute(strSQL)
        return rows
    } catch (error) {
        return false
    }
}

async function reqTurnoverBalance(data, conn) {
    try {
        const strSQL = `
SELECT 
t.id,
-- Начальный остаток: все операции ДО начала периода
COALESCE(SUM(CASE WHEN tbl1.date < '${data.dateStart}' THEN tbl1.qty ELSE 0 END), 0) AS OB,
-- Обороты ЗА период: приход
COALESCE(SUM(CASE WHEN tbl1.date >= '${data.dateStart}' AND tbl1.date <= '${data.dateFinish}' AND tbl1.dt_ct = 0 THEN tbl1.qty ELSE 0 END), 0) AS PS,
-- Обороты ЗА период: расход
COALESCE(SUM(CASE WHEN tbl1.date >= '${data.dateStart}' AND tbl1.date <= '${data.dateFinish}' AND tbl1.dt_ct = 1 THEN tbl1.qty ELSE 0 END), 0) AS NS,
-- Конечный остаток: начальный остаток + приход - расход (учитываем знак расхода)
COALESCE(SUM(tbl1.qty), 0) AS EB
FROM 
nomenclatures t
LEFT JOIN 
turnover tbl1 ON t.id = tbl1.product_id
WHERE 
tbl1.date <= '${data.dateFinish}' AND t.ID =${data.productID}
GROUP BY 
t.id;
    `
        const [rows, fields]= await conn.execute(strSQL)
        return rows
    } catch (error) {
        return false
    }
}
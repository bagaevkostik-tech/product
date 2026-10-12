const { text } = require('body-parser');
const mainModule = require('./mainModule');
const { name } = require('xlsx-populate/lib/RichTextFragment');
const db = require('./db');
const socketStorage = require('./socket'); //Расположение места инициализации Socket.io
const util = require('util'); // Преобразование информации об ошибке в чисто текст
const axios = require('axios');
const { execFile } = require('child_process'); // запрос через консоль
const path = require('path');
const fs = require('fs');

// const pathDirBackup = 'I:/Мой диск/Backup' // Папка с бэкапами в Google drive у меня
const pathDirBackup = 'G:/Мой диск/Backup' // Папка с бэкапами в Google drive у oksana


async function directoryCounterpaties(data) {
    try {
        const table = await reqDirectoryCounterpaties()
        
        if (table) {
            return {result: true, table: table};
        } else { return {result: false, text: 'Помилка запиту до бази даних.'}}
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Помилка завантаження.'}
    }
}

async function reqDirectoryCounterpaties() {
    try {
        const [rows] = await db.query(`
            SELECT id,name,IFNULL(FullName,'') AS fullName,IFNULL(OKPO,'') AS OKPO,IFNULL( Address, '') AS address
            ,IFNULL(Telefon, '') AS telefon,type,ifnull(id_bas,'') AS id_bas   FROM counterparties ORDER BY NAME;
    `)
        return rows;
    } catch (error) {
        const textError = 'Ошибка выполнения запроса справояника Контрагентов:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return false
    }
}

async function directoryTransports(data) {
    try {
        const table = await reqDirectoryTransports()
        if (table) {
            return {result: true, table: table};
        } else { return {result: false, text: 'Помилка запиту до бази даних.'}}
    } catch (error) {
        console.log('Error', error)
        return {result: false, text: 'Помилка завантаження.'}
    }
}

async function reqDirectoryTransports() {
    try {
        const [rows] = await db.query(`
SELECT id,name,IFNULL(TractorName,'') AS tractorName,IFNULL(trailerName,'')AS trailerName,IFNULL(TractorModel,'')AS tractorModel
,IFNULL(tractorWeight,'')AS tractorWeight,IFNULL(tractorWeightFull,'')AS tractorWeightFull,IFNULL(tractorSize,'')AS tractorSize
,IFNULL(trailerModel,'')AS trailerModel,IFNULL(trailerWeight,'')AS trailerWeight,IFNULL(trailerWeightFull,'')AS trailerWeightFull
,IFNULL(trailerSize,'')AS trailerSize,IFNULL(driver,'')AS driver,IFNULL(driverLicense,'')AS driverLicense,IFNULL(id_bas,'')AS id_bas
 FROM transports ORDER BY NAME;
             `)
 
        return rows;
    } catch (error) {
        const textError = 'Ошибка выполнения запроса справояника Транспорта:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return false
    }
}

async function directoryProducts(data) {
    try {
        const table = await reqDirectoryProducts()
        if (table) {
            return {result: true, table: table}
        } else { return {result: false, text: 'Помилка запиту до бази даних.'}}
    } catch (error) {
        const textError = 'Ошибка выполнения запроса справочника Номенклатуры:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return {result: false, text: 'Пимилка завантаження.'}
    }
}

async function reqDirectoryProducts() {
    try {
        const [rows] = await db.query(`
            SELECT id, name, ifnull(FullName,'') AS fullName,IFNULL(number_BAS,'') AS id_bas FROM nomenclatures ORDER BY NAME;
            `)
        return rows;
    } catch (error) {
        const textError = 'Ошибка выполнения запроса из БД справочника Номенклатуры:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return false
    }
}

async function saveCounterparty(item) {
    const data = item.table
    try {
        if (!data.id) {
            await db.query(`INSERT INTO counterparties (NAME) VALUE ('${data.name}');`)
            const [row] = await db.query('SELECT id FROM counterparties ORDER BY id DESC LIMIT 1;')
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
        await db.query(strSQL)

        const table = await reqDirectoryCounterpaties()
        data.table = table
        data.result = true
        if (table) {
            data.table = table
            data.result = true
            return data
        } else {return {result: false, text: 'Помилка запиту до бази даних.'}}
    } catch (error) {
        const textError = 'Ошибка сохранения контрагента:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return { result: false, text: 'Помилка збереження.' }
    }
}

async function openCounterparty(data) {
    try {
        if (!data.id) return
        const [rows] = await db.query(`
            SELECT id,name,fullName,OKPO,address,telefon,type FROM counterparties WHERE id=${data.id};
            `)
        if (!rows[0].id) return { result: false, text: 'Помилка завантаження.' }
        rows[0].result = true
        if (rows[0].fullName === null) rows[0].fullName = ''
        if (rows[0].OKPO === null) rows[0].OKPO = ''
        if (rows[0].address === null) rows[0].address = ''
        if (rows[0].telefon === null) rows[0].telefon = ''
        return rows[0]
    } catch (error) {
        const textError = 'Ошибка запроса данных контрагента:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return { result: false, text: 'Помилка завантаження.' }
    }

}

async function saveTransport(item) {
    const data = item.table
    try {
        if (!data.id) {
            await db.query(`INSERT INTO transports (NAME) VALUE ('${data.name}');`)
            const [row] = await db.query('SELECT id FROM transports ORDER BY id DESC LIMIT 1;')
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

        await db.query(`UPDATE transports SET NAME='${data.name}' ${val} WHERE id=${data.id};`)

        const table = await reqDirectoryTransports()
        if (table) {
            data.table = table
            data.result = true
            return data
        } else {return {result: false, text: 'Помилка запиту до бази даних.'}}
    } catch (error) {
        const textError = 'Ошибка сохраненияя данных транспорта:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return { result: false, text: 'Помилка збереження.' }
    }

}

async function saveProduct(item) {
    const data = item.table
    // console.log(data)
    try {
        if (!data.id) {
            await db.query(`INSERT INTO nomenclatures (NAME) VALUE ('${data.name}');`)
            const [row] = await db.query('SELECT id FROM nomenclatures ORDER BY id DESC LIMIT 1;')
            data.id = row[0].id
        }
        let val = ''

        if (data.fullName) val += `,fullName = '${data.fullName}'`
        if (data.id_bas) val += `,number_BAS = '${data.id_bas}'`

        await db.query(`UPDATE nomenclatures SET NAME='${data.name}' ${val} WHERE id=${data.id};`)
        const table = await reqDirectoryProducts()
        data.table = table
        data.result = true
        return data
    } catch (error) {
        const textError = 'Ошибка сохранения данных Номенклатуры:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return { result: false, text: 'Помилка збереження.' }
    }

}

async function openTransport(data) {
    if (!data.id) return
    const strSQL = 
`SELECT id,name,ifnull(TractorName, "") AS TractorName,ifnull(TractorModel,'')AS TractorModel,
ifnull(TractorWeight,'')AS TractorWeight,ifnull(TractorWeightFull,'')as TractorWeightFull,ifnull(TractorSize,'')AS TractorSize,
ifnull(TrailerName,'')as TrailerName,ifnull(TrailerModel,'')as TrailerModel,
ifnull(TrailerWeight,'')as TrailerWeight,ifnull(TrailerWeightFull,'')as TrailerWeightFull,ifnull(TrailerSize,'')as TrailerSize,
ifnull(Driver,'')as Driver,ifnull(DriverLicense,'') AS DriverLicense
FROM transports WHERE id= ?;`

    try {
        const [rows] = await db.query(strSQL, [data.id])
        rows[0].result = true
        return rows[0]
    } catch (error) {
        const textError = 'Ошибка получения из БД данных Транспорта:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return { result: false, text: 'Помилка завантаження.' }
    }

}

async function reqUser(data) {
    try {
        const strSQL = 'SELECT name FROM users WHERE id= ?;'
        const [rows] = await db.query(strSQL, [data.username])
        const result = {result: true, name: rows[0].name}
        return result
    } catch (error) {
        const textError = 'Ошибка запроса имени пользователя:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return { result: false, text: 'Помилка отримання даних.' }
    }
    
}

async function initializationAccounting(data) {
    try {

        const products = await reqDirectoryProducts()
        const transports = await reqDirectoryTransports()
        const counterparties = await reqDirectoryCounterpaties()

        if (products && transports && counterparties) {
            return {result: true, products: products, transports: transports,
                 counterparties: counterparties}
        } else {return { result: false, text: 'Помилка отримання даних.' }}
    } catch (error) {
        const textError = 'Ошибка получения данных справочников:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return { result: false, text: 'Помилка завантаження.' }
    }
}

async function turnoverBalance(data) {
    try {
        const turnover = await reqTurnover(data)
        const balance = await reqTurnoverBalance(data)
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
        const [rows]= await db.query(strSQL)
        if (rows.length === 0) {
            await db.query(`DELETE FROM ${directory} WHERE id = ${data.id};`)
            switch(data.directory) {
                case 'counterparties':
                    table = await reqDirectoryCounterpaties()
                    break
                case 'transports':
                    table = await reqDirectoryTransports()
                    break
                case 'products':
                    table = await reqDirectoryProducts()
                    break
                default:
                    return
            }
            return {result: true, table: table}
        } else {
            return { result: false, listRow: rows, text: 'Існують пов’язані записи.', id:data.id }
        }
    } catch (error) {
        const textError = 'Ошибка удаления данных:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return { result: false, text: 'Помилка обробки запиту.' }
    }
}

async function saveErrorToDB(data) {
    const sql = 'INSERT INTO messages (recipient, TEXT, sender) VALUES (?, ?, ?)';
    const sql2 = 'SELECT * FROM messages WHERE recipient = ? AND TEXT = ? AND sender = ? ORDER BY time_creation DESC'
    try {
        await db.query(sql, ['kostya', data, 'admin']);
        const io = socketStorage.getIO();
        const [rows] = await db.query(sql2, ['kostya', data, 'admin'])
        io.to('kostya').emit('received_message', rows);

        console.log('Ошибка успешно сохранена в базу данных');
    } catch (error) {
        console.error('Не удалось сохранить ошибку в БД:', error.message);
    }
}

async function sendMsg(data) {
    const sql = 'INSERT INTO messages (recipient, TEXT, sender) VALUES (?, ?, ?)';
    const sql2 = 'SELECT * FROM messages WHERE recipient = ? AND TEXT = ? AND sender = ? ORDER BY time_creation DESC'
    try {
        await db.query(sql, [data.recipient, data.text, data.sender]);
        const io = socketStorage.getIO();
        const [rows] = await db.query(sql2, [data.recipient, data.text, data.sender])
        io.to(data.recipient).emit('received_message', rows);
        
        console.log('Успешно сохранено сообщение в базу данных');
    } catch (error) {
        const textError = 'Ошибка сохранения сообщения в БД мессенжера\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        console.error('Не удалось сообщение!');
    }
}

async function suppliersDebt(data) {

    const [rows] = await  db.query(`SELECT OKPO, id_bas FROM counterparties WHERE id = ${data.id};`)
    if (!rows[0].OKPO && !rows[0].id_bas) {return {result: false, text: 'Постачальник немає обов’язкових реквізитів'}}

    const response = await axios.get('http://localhost/BAS_XEZ_V/hs/balance/suppliers', {
            params: {
                vendor_code: rows[0].id_bas,
                OKPO: rows[0].OKPO,
                period_start: data.dateStart,
                period_end: data.dateFinish
            },
            auth: {
                username: process.env.API_BAS_USER,
                password: process.env.API_BAS_PASS
            }
        })
        .then(response => {
            // if (!response.ok) {
            //     const errorText = response.text();
            //     console.log("--- Полный ответ сервера об ошибке ---");
            //     console.log(errorText); // Смотрим сюда в консоли Node.js!
            //     console.log("-------------------------------------");
            //     console.error(`Код ошибки: ${response.status}`);
            // }
            // console.log(response.status)
            return response.data
        })
        .catch(error => {
            saveErrorToDB('Ошибка запроса задолженности поставщика из Бухгалтерии')
            console.error(error)
        });
    // if (!response.ok) {return {result: false, text: 'Помилка запиту до BAS Бухгалтерія'}}
    // else {return {result: true, table: response}}
        return {result: true, table: response, dateStart: data.dateStart, dateFinish: data.dateFinish}
}



// Экспортируем функцию
module.exports = {
    directoryCounterpaties,
    directoryTransports,
    directoryProducts,
    saveCounterparty,
    openCounterparty,
    saveTransport,
    saveProduct,
    openTransport,
    reqUser,
    initializationAccounting,
    turnoverBalance,
    deleteDirectoryItemCounterparty,
    saveErrorToDB,
    sendMsg,
    suppliersDebt
};


async function reqTurnover(data) {
    try {
        const strSQL = `
SELECT tbl.document AS document,qty,DATE_FORMAT(tbl.date, '%d.%m.%Y %H:%i:%s') AS date
FROM turnover AS tbl
WHERE tbl.date BETWEEN ? AND ? 
AND tbl.product_id= ?
ORDER BY tbl.date;  
        `
        const [rows]= await db.query(strSQL,[data.dateStart, data.dateFinish, data.productID])
        return rows
    } catch (error) {
        const textError = 'Ошибка запроса оборотного баланса:\n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return false
    }
}

async function reqTurnoverBalance(data) {
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
        const [rows]= await db.query(strSQL)
        return rows
    } catch (error) {
        const textError = 'Ошибка запроса оборотного баланса из БД \n' + util.inspect(error, { showHidden: false, depth: null });
        await saveErrorToDB(textError)
        return false
    }
}

// Создание бэкапа
function createDump() {
    // Увеличиваем maxBuffer на случай, если база данных весит несколько мегабайт
    const options = {
        maxBuffer: 1024 * 1024 * 100 // 100 МБ
    };

    const dateTime = mainModule.formatDateUsTime(new Date())
    const nameFile = 'supplys_'   + dateTime.replace(/:/g, '_') + '.sql'

    const outputPath = path.join(pathDirBackup, nameFile);
    // Укажите точный путь к вашему mysqldump.exe
    const mysqldumpPath = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe'; 

    execFile(mysqldumpPath, [
        '-hlocalhost',
        '-u', process.env.DB_USER,
        `-p${process.env.DB_PASS}`,
        process.env.DB_NAME
    ], options, (error, stdout, stderr) => {
        if (error) {
            const textError = 'Ошибка при выполнении backup\n' + util.inspect(error.message, { showHidden: false, depth: null });
            saveErrorToDB(textError)
            console.error(`Ошибка при выполнении: ${error.message}`);
            return;
        }
        if (stderr) {
            console.warn(`Предупреждение: ${stderr}`);
        }
        // Записываем полученные данные в файл
        fs.writeFile(outputPath, stdout, (fsError) => {
            if (fsError) {
                const textError = 'Ошибка записи файла backup\n' + util.inspect(fsError.message, { showHidden: false, depth: null });
                saveErrorToDB(textError)
                return;
            }
            console.log(`Резервная копия успешно сохранена в: ${outputPath}`);
        });
    });
}

function runDailyAt(hour, minute, callback) {
  function schedule() {
    const now = new Date();
    const target = new Date();
    
    // Устанавливаем целевое время на сегодня
    target.setHours(hour, minute, 0, 0);
    
    // Если время на сегодня уже прошло, переносим на завтра
    if (now > target) {
      target.setDate(target.getDate() + 1);
    }
    
    const delay = target.getTime() - now.getTime();
    
    setTimeout(() => {
      callback();
      removeOldBackup()
      // Повторяем каждый день
        setInterval(() => {
        callback();
        removeOldBackup();
        }, 24 * 60 * 60 * 1000); 
    }, delay);
  }

  schedule();
}

// Запуск каждый день в 
runDailyAt(2, 30, () => {
    createDump()
});

// Удаление старых файлов бэкап
function removeOldBackup() {
    const date = new Date();
    
    // Укажите вашу дату для фильтрации
    const targetDate = date.setDate(date.getDate() - 10);    

    fs.readdir(pathDirBackup, (err, files) => {
        if (err) {
            const textError = 'Ошибка чтения папки:\n' + util.inspect(err, { showHidden: false, depth: null });
            saveErrorToDB(textError)
            console.error('Ошибка чтения папки:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(pathDirBackup, file);

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    const textError = `Ошибка чтения параметров файла ${file}:\n` + util.inspect(err, { showHidden: false, depth: null });
                    saveErrorToDB(textError)
                    return;
                }

                // Проверяем, что это файл (а не подпапка) и сравниваем дату создания
                if (stats.isFile() && (new Date(stats.birthtime).getTime() < targetDate)) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            const textError = 'Ошибка при удалении файла бэкап:\n' + util.inspect(err, { showHidden: false, depth: null });
                            saveErrorToDB(textError)
                            return;
                        }
                    });
                }
            });
        });
    });
}
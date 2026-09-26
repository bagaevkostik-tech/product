const mysql = require('mysql2/promise')
const mainModule = require('./mainModule');
const myModule = require('./myModule');
const util = require('util');

let config = {
    host: 'localhost',
    user: 'kostya',
    database: 'supplys',
    password: '9482'
}

// Получение данных из БД мессенжера
async function messenger(data) {
    try {
        const reqName = await myModule.reqUser(data)
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)
        const strSQL = `
SELECT * FROM messages WHERE recipient = '${data.username}' ORDER BY time_creation;
        `
        const [messages, fields] = await conn.execute(strSQL)
        conn.end()
        return {result: true, name: reqName.name, userID: data.username, messages: messages}
    } catch (error) {
        console.log('Error', error)
        const textError = 'Получение данных из БД мессенжера\n' + util.inspect(error, { showHidden: false, depth: null });
        await myModule.saveErrorToDB(textError)
        return { result: false, text: 'Помилка завантаження.' }
    }
}

// Внесение инфо о доставке сообщения в БД мессенжера
async function reportDLVD(data) {
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)
        const strSQL = `
            UPDATE messages SET delivered = 1 WHERE id IN (${data.messeeges});
        `
        await conn.execute(strSQL)
        conn.end()
        return {result: true}
    } catch (error) {
        console.log('Error', error)
        const textError = 'Внесение инфо о доставке сообщения в БД мессенжера\n' + util.inspect(error, { showHidden: false, depth: null });
        await myModule.saveErrorToDB(textError)
        return { result: false, text: 'Помилка \nВнесение инфо о доставке сообщения в БД мессенжера' }
    }
}

// Внесение инфо о прочтении сообщения в БД мессенжера
async function reporReadMsg(data) {
    try {
        config.user = data.username
        config.password = data.userpass
        const conn = await mysql.createConnection(config)
        const strSQL = `
            UPDATE messages SET read_msg = 1 WHERE id IN (${data.messeeges});
        `
        await conn.execute(strSQL)
        conn.end()
        return {result: true}
    } catch (error) {
        console.log('Error', error)
        const textError = 'Внесение инфо о прочтении сообщения в БД мессенжера\n' + util.inspect(error, { showHidden: false, depth: null });
        await myModule.saveErrorToDB(textError)
        return { result: false, text: 'Помилка \nВнесение инфо о прочтении сообщения в БД мессенжера' }
    }
}

// Запроc о поступлении новых сообщениях в БД
async function newMsg(data) {
    let strSQL
    let conn
    if (data) {
        config.user = data.username
        config.password = data.userpass
        strSQL = `
            SELECT * FROM messages WHERE recipient='${data.username}' AND (delivered = 0 OR delivered IS NULL) ORDER BY time_creation;
        `
    } else {
        strSQL = `
            SELECT * FROM messages WHERE delivered = 0 OR delivered IS NULL ORDER BY recipient, time_creation;
        `
    }
    conn = await mysql.createConnection(config)
    try {
        const [tableNewMsg, fields] = await conn.execute(strSQL)
        conn.end()
        return {result: true, table: tableNewMsg}
    } catch (error) {
        console.log('Error', error)
        const textError = 'Запроc о поступлении новых сообщениях в БД\n' + util.inspect(error, { showHidden: false, depth: null });
        await myModule.saveErrorToDB(textError)
        return { result: false, text: 'Запроc о поступлении новых сообщениях в БД' }
    }
}

// Экспортируем функцию
module.exports = {
    messenger: messenger,
    reportDLVD: reportDLVD,
    reporReadMsg: reporReadMsg,
    newMsg: newMsg
}    
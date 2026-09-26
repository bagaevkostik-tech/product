// db.js
const mysql = require('mysql2');

// Создаем пул подключений
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '19071994',
  database: 'supplys',
  waitForConnections: true,
  connectionLimit: 10, // Максимальное количество одновременных подключений
  queueLimit: 0
});

// Экспортируем пул с поддержкой async/await
module.exports = pool.promise();

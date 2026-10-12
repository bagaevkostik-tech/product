// db.js
const mysql = require('mysql2');

// Создаем пул подключений
const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Максимальное количество одновременных подключений
  queueLimit: 0
});

// Экспортируем пул с поддержкой async/await
module.exports = pool.promise();

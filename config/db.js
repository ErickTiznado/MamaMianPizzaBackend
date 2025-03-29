const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.BD_HOST,
    user: process.env.BD_USER,
    password: process.env.BD_PASSWORD,
    database: process.env.BD_NAME,
    port: process.env.BD_PORT || 3306,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    connectionLimit: 10,
});

module.exports = pool;
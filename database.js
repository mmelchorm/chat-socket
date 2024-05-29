const mysql = require('mysql2');

const db = mysql.createConnection({
    user: 'root',
    password: '',
    host: 'localhost',
    database: 'chat_grupal',
    port: 3306
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

module.exports = db;

const mysql = require('mysql2');

const db = mysql.createConnection({
    user: 'root',
    password: 'cWVHEVYjytUoxLvIdaZwYWSfpqwApVKh',
    host: 'monorail.proxy.rlwy.net',
    database: 'railway',
    port: 50919
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

module.exports = db;

require('dotenv').config()
const mysql = require('mysql')

const host = process.env.DB_HOST || "localhost"
const user = process.env.DB_USER || "root"
const pass = process.env.DB_PASS || ""
const dbName = process.env.DB_NAME || "db"

let db = mysql.createConnection({
    host: host,
    user: user,
    password: pass,
    database: dbName
});

db.connect(function(err) {
    if (err) {
        console.log("Can't connect to MySQL");
        throw err
    } else {
        console.log("MySQL Connected!");
    } 
});

module.exports = db
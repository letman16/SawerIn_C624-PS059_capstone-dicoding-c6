import mysql2 from 'mysql2'
const conn = mysql2.createConnection({
    host: process.env.HOST,
    user: process.env.USERDB,
    password: process.env.PASSDB,
    database: process.env.DBNAME
});

export default { conn }
import mysql2 from 'mysql2'
const conn = mysql2.createConnection({
    host: process.env.HOST,
    user: process.env.USERDB,
    password: process.env.PASSDB,
    database: process.env.DBNAME
});

conn.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database!');
});

export default { conn }
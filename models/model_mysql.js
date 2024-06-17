import mysql2 from 'mysql2'
const conn = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sawerin'
});

export default { conn }
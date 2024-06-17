import mysql2 from 'mysql2'
const conn = mysql2.createConnection({
    host: process.env.HOST,
    user: process.env.USERDB,
    password: process.env.PASSDB,
    database: process.env.DBNAME,
    connectTimeout: 60000, // Contoh timeout 60 detik
    acquireTimeout: 60000,
    timeout: 60000
});

conn.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database!');
});

conn.on('error', (err) => {
    console.error('MySQL connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        // Mencoba untuk melakukan koneksi ulang
        conn.connect((error) => {
            if (error) {
                console.error('Error reconnecting:', error);
            } else {
                console.log('Reconnected to MySQL database!');
            }
        });
    } else {
        throw err;
    }
});


export default { conn }
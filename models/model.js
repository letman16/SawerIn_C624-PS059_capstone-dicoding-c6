import { Sequelize, DataTypes} from 'sequelize';

// Konfigurasi MySQL2 tanpa opsi timeout
const conn = mysql2.createConnection({
    host: process.env.HOST,
    user: process.env.USERDB,
    password: process.env.PASSDB,
    database: process.env.DBNAME
});

// Konfigurasi Sequelize dengan dialectOptions
const sequelize = new Sequelize(process.env.DBNAME, process.env.USERDB, process.env.PASSDB, {
    host: process.env.HOST,
    dialect: 'mysql',
    dialectOptions: {
        connectTimeout: 60000 // Contoh timeout 60 detik
    }
});

export { sequelize, testConnection, DataTypes };

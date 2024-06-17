import { Sequelize, DataTypes} from 'sequelize';

const sequelize = new Sequelize(process.env.DBNAME, process.env.USERDB, process.env.PASSDB, {
    host: process.env.HOST,
    dialect: 'mysql',
    dialectOptions: {
        connectTimeout: 60000 // Contoh timeout 60 detik
    }
});

// Test connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection to database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export { sequelize, testConnection, DataTypes };

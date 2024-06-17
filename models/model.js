import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DBNAME, process.env.USERDB, process.env.PASSDB, {
    host: process.env.HOST,
    dialect: 'mysql'
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

export { sequelize, testConnection };

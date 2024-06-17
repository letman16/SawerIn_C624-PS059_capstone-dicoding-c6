import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize(process.env.DBNAME, process.env.USERDB, process.env.PASSDB, {
    host: process.env.HOST,
    dialect: 'mysql'
});
export { sequelize, DataTypes };
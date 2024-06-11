import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize("sawerin", "root", "", {
    host: 'localhost',
    dialect: 'mysql'
});
export { sequelize, DataTypes };
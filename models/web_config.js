import { sequelize, DataTypes } from "./model.js";
const web_configs = sequelize.define('web_configs', {
    id_web_config : {
        type: DataTypes.STRING,
        primaryKey: true
    },
    nama_project: DataTypes.STRING,
    domain: DataTypes.STRING,
    status_project: DataTypes.STRING

});
export default web_configs
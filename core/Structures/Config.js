const Sequelize = require("sequelize");
const Database = require("../Database");

const Config = Database.db.define("config", {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    owners: Sequelize.STRING,
    prefix: Sequelize.STRING,
    disabled: Sequelize.BOOLEAN,
    permissions: Sequelize.STRING
});

Config.sync();
module.exports = Config;

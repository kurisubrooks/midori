const Sequelize = require("sequelize");
const Database = require("../Database");

const Bank = Database.db.define("bank", {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    balance: Sequelize.INTEGER
});

Bank.sync();
module.exports = Bank;

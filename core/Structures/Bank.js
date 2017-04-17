const Sequelize = require("sequelize");
const Database = require("../Database");

const Bank = Database.db.define("bank", {
    total: Sequelize.NUMBER,
    spent: Sequelize.NUMBER,
    transactions: Sequelize.STRING,
    pendingTransactions: Sequelize.STRING
});

Bank.sync();
module.exports = Bank;

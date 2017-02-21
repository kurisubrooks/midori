const Sequelize = require("sequelize");
const Database = require("../Database");

const Users = Database.define("users", {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    data: Sequelize.STRING
});

Users.sync();

module.exports = Users;

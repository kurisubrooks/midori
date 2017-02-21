const Sequelize = require("sequelize");
const Database = require("../Database");

const Users = Database.define("users", {
    guid: Sequelize.STRING,
    data: Sequelize.STRING
});

Users.sync();

console.log(Users);

module.exports = Users;

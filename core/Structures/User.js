const Sequelize = require("sequelize");
const Database = require("../Database");

const Users = Database.db.define("users", {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    data: Sequelize.STRING
});

Users.sync();
module.exports = Users;

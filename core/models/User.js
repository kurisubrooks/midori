import Sequelize from "sequelize";
import Database from "../Database";

const Users = Database.define("users", {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    data: Sequelize.STRING
});

Users.sync();

console.log(Users);

module.exports = Users;

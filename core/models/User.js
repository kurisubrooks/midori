import Sequelize from "sequelize";
import Database from "../Database";

const Users = Database.define("users", {
    id: Sequelize.STRING,
    data: Sequelize.STRING
});

Users.sync();

export default Users;

const Sequelize = require("sequelize");
const path = require("path");

const database = new Sequelize({
    logging: false,
    dialect: "sqlite",
    storage: path.join(__dirname, "..", "db.sqlite")
});

class Database {
    static get db() {
        return database;
    }

    static get Models() {
        return {
            Users: require("./Structures/User"),
            Config: require("./Structures/Config"),
            Bank: require("./Structures/Bank")
        };
    }
}

module.exports = Database;

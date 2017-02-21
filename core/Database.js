const Sequelize = require("sequelize");
const path = require("path");

module.exports = new Sequelize({
    logging: false,
    dialect: "sqlite",
    storage: path.join(__dirname, "../", "db.sqlite")
});

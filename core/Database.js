import Sequelize from "sequelize";
import path from "path";

export default new Sequelize({
    logging: false,
    dialect: "sqlite",
    storage: path.join(__dirname, "../", "db.sqlite")
});

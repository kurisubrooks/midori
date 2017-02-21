const Command = require("../../core/Command");
const Database = require("../../core/Database");
const { Users } = require("../../core/Models");

module.exports = class DatabaseCommand extends Command {
    constructor(client) {
        super(client, {
            name: "database",
            description: "Interact with Midori's Database",
            aliases: ["db", "set"]
        });
    }

    async run(message, channel, user, args) {
        const command = message.command;
        const intention = args[0];
        const query = args.slice(1).join(" ");
        console.log(Database.models.users);
        let dbUser = await Users.findOne({ where: { guid: user.id } });

        console.log(dbUser);
        console.log(Database.models.users);

        // Check if User Exists in DB, Create if they don't
        if (!user) {
            dbUser = await Users.create({
                guid: user.id,
                data: "{}"
            });
        }

        console.log(dbUser);

        // Add or Set a value in the DB
        if (command === "add" || command === "set") {
            console.log(command, intention, query);
            return dbUser;
        }

        // Remove or Delete a value from the DB
        /* if (command === "remove" || command === "delete") {
            return this;
        } */

        return false;
    }
};

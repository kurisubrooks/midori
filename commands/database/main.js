const Command = require("../../core/Command");
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

        let dbUser = await Users.findOne({ where: { id: user.id } });

        let template = {
            weather: null,
            balance: null
        };

        // Check if User Exists in DB, Create if they don't
        if (!dbUser) {
            dbUser = await Users.create({
                id: user.id,
                data: JSON.stringify(template)
            });

            this.log(`Added User: ${user.id}`, "debug");
        }

        let data = await Users.findOne({ where: { id: user.id } });

        // Add or Set a value in the DB
        if (command === "add" || command === "set") {
            let manipulate = JSON.parse(data.data);
            let update = false;

            if (intention === "weather" || intention === "location") {
                manipulate.weather = query;
                update = true;
            }

            if (update) {
                await data.update({ data: JSON.stringify(manipulate) });
                this.log(`Updated User: ${user.id}`, "debug");
                this.log(JSON.stringify(manipulate), "debug");
                message.reply(`Updated Database successfully.`);
            }

            return null;
        }

        // Remove or Delete a value from the DB
        /* if (command === "remove" || command === "delete") {
            return this;
        } */

        return false;
    }
};

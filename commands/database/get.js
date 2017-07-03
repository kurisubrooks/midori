const Database = require("./set");
const Command = require("../../core/Command");

class Get extends Command {
    constructor(client) {
        super(client, {
            name: "Get",
            description: "Get Data from the Database",
            aliases: []
        });
    }

    async run(message, channel, user) {
        const db = await Database.getUser(user);
        await message.reply(`\`\`\`js\n${JSON.stringify(JSON.parse(db.data), null, 4)}\n\`\`\``);
        return false;
    }
}

module.exports = Get;

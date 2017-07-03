const Command = require("../../core/Command");

class Purge extends Command {
    constructor(client) {
        super(client, {
            name: "Purge",
            description: "Purge a user from the Database",
            aliases: [],
            admin: true,
            disabled: true
        });
    }
}

module.exports = Purge;

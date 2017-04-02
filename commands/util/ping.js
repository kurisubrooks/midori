const Command = require("../../core/Command");

class Ping extends Command {
    constructor(client) {
        super(client, {
            name: "Ping",
            description: "Test Connection to Midori",
            aliases: []
        });
    }

    async run(message, channel) {
        message.delete().catch(err => err.message);
        return channel.sendMessage("Ping...").then(msg => msg.edit(`Pong! \`${msg.createdTimestamp - message.createdTimestamp}ms\``));
    }
}

module.exports = Ping;

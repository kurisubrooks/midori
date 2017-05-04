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
        this.delete(message);
        return channel.send("Ping...")
            .then(msg => msg.edit(`Pong! \`${msg.createdTimestamp - message.createdTimestamp}ms\``));
    }
}

module.exports = Ping;

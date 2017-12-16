const Command = require("../../core/Command");

class Stop extends Command {
    constructor(client) {
        super(client, {
            name: "Stop",
            description: "Stops Midori",
            aliases: ["restart"],
            admin: true
        });
    }

    async run(message, channel, user) {
        await this.error(`Restart Triggered by ${user.nickname}`, channel);
        return setTimeout(() => process.exit(0), 500);
    }
}

module.exports = Stop;

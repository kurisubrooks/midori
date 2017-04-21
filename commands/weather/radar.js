const Command = require("../../core/Command");

class Radar extends Command {
    constructor(client) {
        super(client, {
            name: "Radar",
            description: "Get the latest Weather Radar",
            aliases: ["rain"]
        });
    }

    async run(message, channel, user, args) {
        const place = args[0] || "sydney";
        const type = args[1] || "animated";
        const ext = type === "animated" ? "gif" : "png";
        const url = `https://api.kurisubrooks.com/api/radar?id=${place}&type=${type}`;

        await channel.sendFile(url, `radar.${ext}`);
        return this.delete(message);
    }
}

module.exports = Radar;

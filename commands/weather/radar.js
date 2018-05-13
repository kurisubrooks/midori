const Command = require("../../core/Command");
const Database = require("../../core/Database");

class Radar extends Command {
    constructor(client) {
        super(client, {
            name: "Radar",
            description: "Get the latest Weather Radar",
            aliases: ["rain"]
        });
    }

    async run(message, channel, user, args) {
        const locations = ["sydney", "canberra", "adelaide", "melbourne"];

        // Check if user was pung, or didn't provide any args
        if (message.pung.length > 0 || (args.length === 0 && message.pung.length === 0)) {
            if (message.pung.length > 0) user = message.pung[0];

            const userDB = await Database.Models.Users.findOne({ where: { id: user.id } });
            let error = "this user does not have a set radar location.";

            if (message.author.id === user.id) {
                error = `please provide a query or set your location with \`${message.prefix}set radar <location>\``;
            }

            // Checks for User in DB
            if (!userDB) {
                return message.reply(error);
            }

            const data = JSON.parse(userDB.data);

            // Checks for Radar in DB
            if (!data.radar) {
                return message.reply(error);
            }

            args[0] = data.radar.toLowerCase();
        }

        if (locations.indexOf(args[0].toLowerCase()) === -1) {
            return message.reply(`Sorry! It doesn't look like that location is supported. Supported locations include: \`${locations.join(", ")}\``);
        }

        const place = args[0] ? args[0].toLowerCase() : "sydney";
        const type = args[1] ? args[1].toLowerCase() : "animated";
        const ext = type === "animated" ? "gif" : "png";
        const url = `https://api.kurisubrooks.com/api/radar?id=${place}&type=${type}`;

        await channel.send({ files: [{ name: `radar.${ext}`, attachment: url }] });
        return this.delete(message);
    }
}

module.exports = Radar;

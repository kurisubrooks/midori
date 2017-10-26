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
        if (message.pung.length > 0) {
            this.log(`Getting Radar for user ${message.pung[0].id}`, "debug");
            const userDB = await Database.Models.Users.findOne({ where: { id: message.pung[0].id } });

            // Check if User exists in DB
            if (userDB) {
                const data = JSON.parse(userDB.data);

                // Checks if User has a set location
                if (data.radar) {
                    args[0] = data.radar;
                } else {
                    return message.reply("this user has not set their radar location.");
                }
            } else {
                return message.reply("this user does not have a database entry for their local radar.");
            }
        }

        const place = args[0] || "sydney";
        const type = args[1] || "animated";
        const ext = type === "animated" ? "gif" : "png";
        const url = `https://api.kurisubrooks.com/api/radar?id=${place}&type=${type}`;

        await channel.send({ files: [{ name: `radar.${ext}`, attachment: url }] });
        return this.delete(message);
    }
}

module.exports = Radar;

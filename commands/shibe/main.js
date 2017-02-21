const request = require("request-promise");
const Command = require("../../core/Command");

module.exports = class ShibeCommand extends Command {
    constructor(client) {
        super(client, {
            name: "shibe",
            description: "Post a randomly selected image of a Shiba Inu",
            aliases: ["shib", "doge"]
        });
    }

    async run(message, channel) {
        const response = await request({
            uri: "http://shibe.online/api/shibes?count=1&httpsurls=true",
            headers: { "User-Agent": "Mozilla/5.0" },
            json: true
        });

        await channel.sendFile(response[0]);
        return message.delete();
    }
};

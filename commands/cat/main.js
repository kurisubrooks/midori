const request = require("request-promise");
const Command = require("../../core/Command");

module.exports = class CatCommand extends Command {
    constructor(client) {
        super(client, {
            name: "cat",
            description: "Post a randomly selected image of a cat",
            aliases: ["kat", "kitty"]
        });
    }

    async run(message, channel) {
        const response = await request({
            uri: "http://shibe.online/api/cats?count=1&httpsurls=true",
            headers: { "User-Agent": "Mozilla/5.0" },
            json: true
        });

        await channel.sendFile(response[0]);
        return message.delete();
    }
};

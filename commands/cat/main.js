const request = require("superagent");
const Command = require("../../core/Command");

module.exports = class CatCommand extends Command {
    constructor(client) {
        super(client, {
            name: "cat",
            description: "Post a randomly selected image of a cat",
            aliases: ["kat", "kitty"]
        });
    }

    async run(message, channel, user) {
        let response;

        try {
            response = await request.get("http://shibe.online/api/cats?count=1&httpsurls=true");
        } catch(err) {
            this.log(err, "fatal", true);
            return this.error(err, channel);
        }

        let embed = { author: { name: user.nickname, icon_url: user.avatarURL }, image: { url: response.body[0] } };
        await channel.sendMessage("", { embed });
        return message.delete().catch(err => err.message);
    }
};

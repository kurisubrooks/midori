const request = require("superagent");
const Command = require("../../core/Command");

module.exports = class ShibeCommand extends Command {
    constructor(client) {
        super(client, {
            name: "shibe",
            description: "Post a randomly selected image of a Shiba Inu",
            aliases: ["shib", "doge"]
        });
    }

    async run(message, channel, user) {
        let response;

        try {
            response = await request.get("http://shibe.online/api/shibes?count=1&httpsurls=true");
        } catch(err) {
            this.log(err, "fatal", true);
            return this.error(err, channel);
        }

        let embed = { author: { name: user.nickname, icon_url: user.avatarURL }, image: { url: response.body[0] } };
        await channel.sendMessage("", { embed });
        return message.delete().catch(err => err.message);
    }
};

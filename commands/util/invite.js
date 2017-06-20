const Command = require("../../core/Command");
const { RichEmbed } = require("discord.js");

class Invite extends Command {
    constructor(client) {
        super(client, {
            name: "Invite",
            description: "Invite Midori to your own server",
            aliases: []
        });
    }

    async run(message, channel) {
        const invite = await this.client.generateInvite(["MANAGE_MESSAGES"]);
        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setTitle("Midori")
            .setDescription("Thanks for showing interest in Midori! Click the\nlink below to invite her to your server.")
            .setThumbnail(this.client.user.avatarURL)
            .addField("\u200b", `[Click Here](${invite})`);

        return channel.send({ embed });
    }
}

module.exports = Invite;

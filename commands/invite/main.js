const Command = require("../../core/Command");
const { RichEmbed } = require("discord.js");

module.exports = class InviteCommand extends Command {
    constructor(client) {
        super(client, {
            name: "invite",
            description: "Invite Midori to your own server",
            aliases: []
        });
    }

    async run(message, channel) {
        const invite = await this.client.generateInvite(["MANAGE_MESSAGES"]);
        const embed = new RichEmbed()
            .setTitle("Midori")
            .setDescription("Thanks for showing interest in Midori! Click the link below to invite her to your server.")
            .setThumbnail(this.client.user.avatarURL)
            .addField("\u200b", `[Click Here](${invite})`);
        return channel.sendEmbed(embed);
    }
};

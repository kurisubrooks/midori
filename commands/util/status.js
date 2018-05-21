const Command = require("../../core/Command");
const moment = require("moment");
require("moment-duration-format");
const worker = require("core-worker");
const { RichEmbed } = require("discord.js");

class Status extends Command {
    constructor(client) {
        super(client, {
            name: "Status",
            description: "Midori Status",
            aliases: ["stats", "uptime"]
        });
    }

    async run(message, channel) {
        const npmv = await worker.process("npm -v").death();
        const etho = require("os").networkInterfaces().eth0;

        if (!etho || !etho[0] || etho[0].mac !== this.config.server) {
            const embed = new RichEmbed()
                .setColor(this.config.colours.warn)
                .setTitle("Warning")
                .setDescription("Midori doesn't seem to be running from it's usual server, this usually means it's running in Development Mode, which may add extra latency to command response time.");

            channel.send({ embed });
        }

        const embed = new RichEmbed()
            .setColor(this.config.colours.default)
            .setTitle("Midori Status")
            .setThumbnail(this.client.user.avatarURL)
            .addField("Uptime", moment.duration(this.client.uptime).format("d[d] h[h] m[m] s[s]"), true)
            .addField("Memory Usage", `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, true)
            .addField("Node Version", process.version.replace("v", ""), true)
            .addField("NPM Version", npmv.data.replace("\n", ""), true);

        return channel.send({ embed });
    }
}

module.exports = Status;

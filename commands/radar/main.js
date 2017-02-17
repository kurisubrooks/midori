import qs from "qs";
import Command from "../../core/Command";

module.exports = class RadarCommand extends Command {
    constructor(client) {
        super(client, {
            name: "radar",
            description: "Get the latest Weather Radar",
            aliases: ["rain"]
        });
    }

    async run(message, channel, user, args) {
        const place = args[0] || "sydney";
        const type = args[1] || "animated";
        const ext = type === "animated" ? "gif" : "png";
        const url = `https://api.kurisubrooks.com/api/radar?${qs.stringify({ id: place, type })}`;

        await channel.sendFile(url, `radar.${ext}`);
        return message.delete();
    }
};

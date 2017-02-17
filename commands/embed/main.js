import Command from "../../core/Command";

export default class EmbedCommand extends Command {
    constructor(client) {
        super(client, {
            name: "embed",
            description: "Preview Discord JSON Embeds",
            aliases: ["e"]
        });
    }

    async run(message, channel, user, args) {
        let embed, before;

        try {
            embed = JSON.parse(args.join(" "));
            before = JSON.parse(args.join(" "));
        } catch(err) {
            message.reply("Unable to parse your JSON Object. Check the syntax and try again.");
            return this.log();
        }

        if (embed.colour) embed.color = embed.colour;
        if (embed.color) embed.color = Number(embed.color);

        await channel.sendMessage(`\`\`\`json\n${JSON.stringify(before, null, 4)}\n\`\`\``, { embed });
        return message.delete();
    }
}

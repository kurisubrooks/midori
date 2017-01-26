"use strict";

module.exports = (bot, channel, user, args, id, message) => {
    let embed;
    let before;

    try {
        embed = JSON.parse(args.join(" "));
        before = JSON.parse(args.join(" "));
    } catch(err) {
        console.error("Couldn't parse");
        console.error(err);
        return channel.sendMessage(`Couldn't parse embed object.\n\`\`\`${err}\`\`\``);
    }

    if (embed.colour) embed.color = embed.colour;
    if (embed.color) embed.color = Number(embed.color);

    return channel.sendMessage(`\`\`\`json\n${JSON.stringify(before, null, 4)}\n\`\`\``, { embed })
        .then(() => message.delete())
        .catch(err => channel.sendMessage(err));
};

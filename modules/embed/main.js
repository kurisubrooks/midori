"use strict"

module.exports = (bot, channel, user, args, id, message, extra) => {
    let embed
    let before

    try {
        embed = JSON.parse(args.join(" "))
        before = JSON.parse(args.join(" "))
    } catch (e) {
        console.error("Couldn't parse")
        console.error(e)
        channel.sendMessage("Couldn't parse embed object.\n```" + e + "```")
        return
    }

    if (embed.colour) embed.color = embed.colour
    if (embed.color) embed.color = Number(embed.color)

    channel.sendMessage(`\`\`\`json\n${JSON.stringify(before, null, 4)}\n\`\`\``, { embed })
        .then(m => message.delete())
        .catch(e => channel.sendMessage(e))
}

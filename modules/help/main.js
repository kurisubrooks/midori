"use strict";

module.exports = (bot, channel, user, args, id, message, extra) => {
    let config = extra.config;
    let embed = {
        "color": config.colours.default,
        "fields": []
    };

    for (let item of config.commands) {
        let command = `${config.sign}${item.command}`;
        let description = item.description;
        if (item.alias) for (let alias of item.alias) command += `, ${config.sign}${alias}`;
        if (item.admin) description += " (Admin Only)";
        if (!(config.commands.indexOf(item) === config.commands.length - 1)) description += "\n\u200b";

        embed.fields.push({
            "name": `\`${command}\``,
            "value": description
        });
    }

    return user.sendMessage("", { embed })
        .then(() => extra.trigger.type !== "dm" && channel.sendMessage(`<@${extra.trigger.id}>, Check your DMs!`))
        .catch(error => extra.util.error(error, "help", channel));
};

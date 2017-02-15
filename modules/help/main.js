module.exports = (bot, channel, user, args, id, message, extra) => {
    const { config, util, trigger } = extra;
    const embed = {
        "color": config.colours.default,
        "fields": []
    };

    for (const item of config.commands) {
        let command = `${config.sign}${item.command}`;
        let description = item.description;

        if (item.alias) for (const alias of item.alias) command += `, ${config.sign}${alias}`;
        if (item.admin) description += " (Admin Only)";
        if (!(config.commands.indexOf(item) === config.commands.length - 1)) description += "\n\u200b";

        embed.fields.push({
            name: `\`${command}\``,
            value: description
        });
    }

    return user.sendMessage("", { embed })
        .then(() => trigger.type !== "dm" && channel.sendMessage(`<@${trigger.id}>, Check your DMs!`))
        .catch(error => util.error(error, "help", channel));
};

import request from "request";

module.exports = (bot, channel, user, args, id, message, extra) => {
    if (args.length < 1) {
        return channel.sendMessage("Please provide a query");
    }

    const { util, colours, trigger } = extra;
    const fetch = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: `https://glosbe.com/gapi/translate?from=en&dest=en&format=json&phrase=${args.join(" ")}`
    };

    return request.get(fetch, (error, res, body) => {
        if (error) {
            return util.error(error, "define", channel);
        }

        const embed = {
            color: colours.default,
            author: {
                name: trigger.nickname,
                icon_url: trigger.avatar
            },
            title: args.join(" "),
            fields: []
        };

        const data = typeof body === "string" ? JSON.parse(body) : body;
        const definitions = Object.entries(data.tuc.filter(tuc => tuc.meanings)[0].meanings.slice(0, 5));

        for (const item of definitions) {
            console.log(item);
            embed.fields.push({ name: item.text.replace(/<\/?i>/g, "_") });
        }

        return channel.sendMessage("", { embed })
            .then(() => message.delete())
            .catch(error => util.error(error, "define", channel));
    });
};

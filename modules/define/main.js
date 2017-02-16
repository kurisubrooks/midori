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
            title: `Define: '${args.join(" ")}'`,
            description: ""
        };

        const data = typeof body === "string" ? JSON.parse(body) : body;

        if (!data.tuc || data.tuc[0].meanings.length === 0) {
            return util.error("No Results Returned", "define", channel);
        }

        if (data.result !== "ok") {
            return util.error("API Error", "define", channel);
        }

        for (let index = 0; index < 5; index++) {
            embed.description += `**${index + 1}.**\u3000${data.tuc[0].meanings[index].text.replace(/<\/?i>/g, "_")}\n`;
        }

        return channel.sendMessage("", { embed })
            .then(() => message.delete())
            .catch(error => util.error(error, "define", channel));
    });
};

import qs from "qs";
import chalk from "chalk";
import request from "request";

module.exports = (bot, channel, user, args, id, message, extra) => {
    if (args.length < 1) {
        return channel.sendMessage("Please provide a query");
    }

    const { util } = extra;
    const langs = args[0].split(",");
    const to = langs[0].toLowerCase();
    const from = langs.length > 1 ? langs[1] : null;
    const query = to === langs[0].toLowerCase() ? args.slice(1).join(" ") : args.join(" ");

    const translate = query => {
        const params = {
            to: to,
            from: from ? from : "",
            query: query
        };

        const fetch = {
            headers: { "User-Agent": "Mozilla/5.0" },
            url: `https://api.kurisubrooks.com/api/translate?${qs.stringify(params)}`
        };

        return request.get(fetch, (error, res, body) => {
            if (error) {
                return util.error(error, "translate", channel);
            }

            const response = JSON.parse(body);
            const to = response.to;
            const from = response.from;
            const query = response.query;
            const result = response.result;

            if (response.ok) {
                // Debug
                console.log(chalk.magenta.bold("To:"), chalk.magenta(to.name));
                console.log(chalk.magenta.bold("From:"), chalk.magenta(from.name));
                console.log(chalk.magenta.bold("Query:"), chalk.magenta(query));
                console.log(chalk.magenta.bold("Translation:"), chalk.magenta(result));

                const embed = {
                    color: extra.colours.default,
                    author: {
                        name: extra.trigger.nickname,
                        icon_url: extra.trigger.avatar
                    },
                    fields: [
                        {
                            name: from.name,
                            value: query
                        },
                        {
                            name: to.name,
                            value: result
                        }
                    ]
                };

                return channel.sendMessage("", { embed })
                    .then(() => message.delete())
                    .catch(error => util.error(error, "translate", channel));
            } else {
                return util.error(response.error, "translate", channel);
            }
        });
    };

    if (query === "^") {
        // Translate Last Message
        return channel.fetchMessages({ before: id, limit: 1 })
            .then(msg => translate(msg.first().content))
            .catch(error => util.error(error, "translate", channel));
    } else if (Number(query)) {
        // Translate Message by ID
        return channel.fetchMessage(query)
            .then(msg => translate(msg.content))
            .catch(error => util.error(error, "translate", channel));
    } else {
        // Translate Query
        return translate(query);
    }
};

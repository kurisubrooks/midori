"use strict"

const _ = require("lodash")
const qs = require("qs")
const ISO = require("iso-639-1")
const chalk = require("chalk")
const request = require("request")

module.exports = (bot, channel, user, args, id, message, extra) => {
    if (args.length < 1) {
        channel.sendMessage("Please provide a query")
        return
    }

    let util = extra.util


    let langs = args[0].split(",")
        langs[0] = langs[0].toLowerCase()
    let to = ISO.validate(langs[0]) ? langs[0] : "en"
    let from = langs.length > 1 ? langs[1] : null
    let query = ISO.validate(langs[0]) ? args.slice(1).join(" ") : args.join(" ")

    let params = {
        to: to,
        query: query
    }

    if (from) params.from = from

    let fetch = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: "http://kurisu.pw/api/translate?" + qs.stringify(params)
    }

    //console.log(fetch.url)

    request.get(fetch, (error, res, body) => {
        if (error) {
            util.error(error, "translate", channel)
            return
        }

        let response = JSON.parse(body)
        let to       = response.to
        let from     = response.from
        let query    = response.query
        let result   = response.result

        // Debug
        console.log(chalk.magenta.bold("To:"), chalk.magenta(to))
        console.log(chalk.magenta.bold("From:"), chalk.magenta(from))
        console.log(chalk.magenta.bold("Query:"), chalk.magenta(query))
        console.log(chalk.magenta.bold("Translation:"), chalk.magenta(result))

        channel.sendMessage(`${user}:\n**${ISO.getName(from)}**: ${query}\n**${ISO.getName(to)}**: ${result}`)
            .then(() => message.delete())
            .catch(error => util.error(error, "translate", channel))

        /*extra.util.webhook(message, {
            "username": extra.hook.bot.username,
            "icon_url": extra.hook.bot.icon,
            "attachments": [
                {
                    "author_name": extra.hook.user.username,
                    "author_icon": extra.hook.user.icon,
                    "color": "#DDDDDD",
                    "text": " ",
                    "fields": [
                        {
                            "title": ISO.getName(from),
                            "value": query
                        },
                        {
                            "title": ISO.getName(to),
                            "value": result
                        }
                    ]
                }
            ]
        })*/
    })
}

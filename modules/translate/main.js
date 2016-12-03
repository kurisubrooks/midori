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
    let to = langs[0] === "tw" ? "tw" : ISO.validate(langs[0]) ? langs[0] : "en"
    let from = langs.length > 1 ? langs[1] : null
    let query = to === langs[0] ? args.slice(1).join(" ") : args.join(" ")

    let params = {
        to: to,
        query: query
    }

    if (from) params.from = from

    let fetch = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: "http://kurisu.pw/api/translate?" + qs.stringify(params)
    }

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

        if (response.ok) {
            // Debug
            console.log(chalk.magenta.bold("To:"), chalk.magenta(to))
            console.log(chalk.magenta.bold("From:"), chalk.magenta(from))
            console.log(chalk.magenta.bold("Query:"), chalk.magenta(query))
            console.log(chalk.magenta.bold("Translation:"), chalk.magenta(result))

            let format = `${user}:\n**${ISO.getName(from)}**: ${query}\n**${ISO.getName(to)}**: ${result}`

            let embed = {
                color: 0xB699FF,
                author: {
                    name: extra.trigger.nickname,
                    icon_url: extra.trigger.avatar
                },
                fields: [
                    {
                        name: ISO.getName(from),
                        value: query
                    },
                    {
                        name: ISO.getName(to),
                        value: result
                    }
                ]
            }

            channel.sendMessage("", { embed })
                .then(() => message.delete())
                .catch(error => util.error(error, "translate", channel))
        } else {
            util.error(response.error, "translate", channel)
        }
    })
}

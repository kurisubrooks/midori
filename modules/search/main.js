"use strict"

const qs = require("qs")
const chalk = require("chalk")
const request = require("request")

module.exports = (bot, channel, user, args, id, message, extra) => {
    if (args.length < 1) {
        channel.sendMessage("Please provide a query")
        return
    }

    let util = extra.util
    let keys = extra.keychain

    let fetch = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: "https://www.googleapis.com/customsearch/v1?" + qs.stringify({
            key: keys.google_search,
            num: "1",
            cx: "006735756282586657842:s7i_4ej9amu",
            q: args.join(" ")
        })
    }

    request.get(fetch, (error, res, body) => {
        if (error) {
            util.error(error, "translate", channel)
            return
        } else if (res.statusCode === 200) {
            let data = typeof body === "object" ? body : JSON.parse(body)

            if (data.searchInformation.totalResults !== "0") {
                let result = data.items[0]
                    result.link = decodeURIComponent(result.link)

                let embed = {
                    color: 0xB699FF,
                    author: {
                        name: extra.trigger.nickname,
                        icon_url: extra.trigger.avatar
                    },
                    url: result.link,
                    title: result.title,
                    description: result.snippet,
                    thumbnail: { },
                    footer: {
                        text: result.link
                    }
                }

                if (result.pagemap && result.pagemap.cse_thumbnail)
                    embed.thumbnail.url = result.pagemap.cse_thumbnail[0].src

                channel.sendMessage("", { embed })
                    .then(() => message.delete())
                    .catch(error => util.error(error, "search", channel))
            } else {
                channel.sendMessage("No Results")
            }
        } else {
            if (res.statusCode === 403) {
                util.error("Exceeded Maximum Daily API Call Limit", "search", channel)
            } else if (res.statusCode === 500) {
                util.error("Unknown Error Occurred", "search", channel)
            } else {
                util.error("Unknown Response Code: " + res.statusCode, "search", channel)
            }
        }
    })
}

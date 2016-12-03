"use strict"

const _ = require("lodash")
const qs = require("qs")
const chalk = require("chalk")
const request = require("request")

module.exports = (bot, channel, user, args, id, message, extra) => {
    if (args.length < 1) {
        channel.sendMessage("Please provide a query")
        return
    } else if (args.length > 1) {
        channel.sendMessage("Please provide only a single word")
        return
    }

    let util = extra.util
    let fetch = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: `https://www.wordsapi.com/mashape/words/${args.join(" ")}/definitions?`+ qs.stringify({
            when: "2016-12-03T13:43:21.622Z",
            encrypted: "8cfdb28ce723919bea9207beec58babaaeb22c0936fd95b8"
        })
    }

    request.get(fetch, (error, res, body) => {
        if (error) {
            util.error(error, "define", channel)
            return
        } else if (res.statusCode === 200) {
            let data = JSON.parse(body, null, 4)

            let embed = {
                color: 0xB699FF,
                author: {
                    name: extra.trigger.nickname,
                    icon_url: extra.trigger.avatar
                },
                title: data.word,
                fields: [ ]
            }

            _.forEach(data.definitions, (v, k) => {
                embed.fields.push({
                    name: v.partOfSpeech,
                    value: `${v.definition} (_${v.partOfSpeech}_)`
                })
            })

            channel.sendMessage("", { embed })
                .then(() => message.delete())
                .catch(error => util.error(error, "define", channel))
        } else {
            if (res.statusCode === 404) {
                channel.sendMessage("No Results")
            } else if (res.statusCode === 400) {
                channel.sendMessage("Bad Request")
            } else if (res.statusCode === 401) {
                channel.sendMessage("Unauthorized")
            } else if (res.statusCode === 429) {
                channel.sendMessage("Rate Limit Exceeded")
            } else if (res.statusCode === 500) {
                channel.sendMessage("Error with API")
            }
         }
    })
}

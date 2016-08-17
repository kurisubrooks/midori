"use strict"

const _ = require("lodash")
const qs = require("qs")
const XML = require("xml2js")
const xml = new XML.Parser()
const chalk = require("chalk")
const request = require("request")

let langs = {
    "da": "Danish",
    "de": "German",
    "el": "Greek",
    "en": "English",
    "es": "Spanish",
    "fi": "Finnish",
    "fr": "French",
    "it": "Italian",
    "ja": "Japanese",
    "ko": "Korean",
    "la": "Latin",
    "ms": "Malay",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt": "Portuguese",
    "ru": "Russian",
    "sv": "Swedish",
    "tl": "Filipino",
    "zh": "Chinese",
    "zh-cn": "Chinese",
    "zh-tw": "Chinese"
}

module.exports = (bot, channel, user, args, id, event, extra) => {
    if (args.length < 1) {
        bot.sendMessage(channel, "Please provide a query")
        return
    }

    let check_iso = (lang) => {
        return (lang.toLowerCase() in langs) ? langs[lang.toLowerCase()] : "Unknown"
    }

    let romaji = function(input) {
        let options = {
            headers: { "User-Agent": "Mozilla/5.0" },
            url: "http://jlp.yahooapis.jp/FuriganaService/V1/furigana",
            form: {
                appid: extra.keychain.yahoojp_romkan,
                sentence: input
            }
        }

        return new Promise((resolve, reject) => {
            request.post(options, function(err, res, body) {
                if (err || res.statusCode !== 200) reject(err)
                else if (body !== undefined) {
                    xml.parseString(body, function(err, res) {
                        if (err) reject(err)
                        else if (res !== undefined) {
                            let output = []
                            if (res.ResultSet) {
                                try {
                                    _.forEach(res.ResultSet.Result[0].WordList[0].Word, (value) => {
                                        if (value.Roman) {
                                            if (value.Roman[0] == " ") return
                                            output.push(value.Roman[0])
                                        } else if (value.Surface) {
                                            if (value.Surface[0] == " ") return
                                            output.push(value.Surface[0])
                                        } else return
                                    })
                                } catch(err) { reject(JSON.stringify(err)) }
                            } else resolve(["null"])

                            resolve(output)
                        }
                    })
                }
            })
        })
    }

    let util = extra.util

    let language    = args[0].split(",")
    let language_to = language[0] === "zh" ? "zh-TW" : language[0]
    let language_fr = language.length > 1 ? language[1] : "auto"
    let to_translate = args.slice(1).join(" ")
                                    .replace(/。/g, ". ")
                                    .replace(/、/g, ", ")
                                    .replace(/？/g, "? ")
                                    .replace(/！/g, "! ")
                                    .replace(/「/g, "\"")
                                    .replace(/」/g, "\" ")
                                    .replace(/　/g, " ")

    let fetch = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: extra.keychain.google_translate + qs.stringify({
            client: "gtx",
            dt: "t",
            sl: language_fr,
            tl: language_to,
            q: to_translate
        })
    }

    request.get(fetch, (err, res, body) => {
        if (err) {
            util.error(err, "translate", channel)
            return
        } else if (body.startsWith(",", 1)) {
            util.error("Malformed API Response\n${body}", "translate", channel)
            return
        } else if (args[0] == " " || !(args[0].split(",")[0] in langs)) {
            util.error("Unknown or Unsupported Language", "translate", channel)
        }

        let response    = JSON.parse(body.replace(/\,+/g, ","))
        let translation = response[0][0][0]
        let query       = typeof response[0][0][1] === "string" ? response[0][0][1] : to_translate
        let fr_language = response[1]
        let to_language = language_to
        let to_romaji   = to_language === "ja" ? translation : query

        let fr_display  = check_iso(fr_language)
        let to_display  = check_iso(to_language)
        let format = [`**${fr_display}:** ${query}`, `**${to_display}:** ${translation.toUpperLowerCase()}`]
        let other

        if (response[3]) {
            if (response[3][0]) {
                _.forEach(response[3][0], (value) => {
                    other += check_iso(value)
                })
            }
        }

        if (to_language === "ja" || fr_language === "ja") {
            romaji(to_romaji).then((furigana, err) => {
                if (err) {
                    util.error(err, "translate", channel)
                    return
                }

                let romaji = `**Romaji:** ${furigana.join(" ")}`

                if (fr_language === "ja") {
                    format.splice(1, 0, romaji)
                } else if (to_language === "ja") {
                    format.push(romaji)
                }

                bot.sendMessage(channel, `${user}:\n${format.join("\n")}`, (err, res) => {
                    if (err) util.error(err, "translate", channel)
                    bot.deleteMessage(event)
                })
            })
        } else {
            bot.sendMessage(channel, `${user}:\n${format.join("\n")}`, (err, res) => {
                if (err) util.error(err, "translate", channel)
                bot.deleteMessage(event)
            })
        }

        // Debug
        console.log(chalk.magenta.bold("Query:"), chalk.magenta(to_translate))
        console.log(chalk.magenta.bold("To:"), chalk.magenta(language_to), chalk.magenta(`(${check_iso(language_to)})`))
        console.log(chalk.magenta.bold("From:"), chalk.magenta(language_fr))
        console.log(chalk.magenta.bold("Translation:"), chalk.magenta(translation))
    })
}

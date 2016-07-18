// nano²
"use strict"

const _ = require("lodash")
const request = require("request")
const japanese = require("japanese")
const XML = require("xml2js")
const xml = new XML.Parser()
const qs = require("qs")

var langs = {
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
    "zh": "Chinese (tw)",
    "zh-cn": "Chinese (zh)",
    "zh-tw": "Chinese (tw)"
}

function check_iso(lang) {
    lang = lang.toLowerCase()
    if (lang in langs) return langs[lang]
    else return "Unknown"
}

function romaji(core, keychain, input, channel) {
    var options = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: "http://jlp.yahooapis.jp/FuriganaService/V1/furigana",
        form: {
            appid: keychain.yahoo_romkan,
            sentence: input
        }
    }

    return new Promise((resolve, reject) => {
        request.post(options, function(error, resp, body) {
            if (error || resp.statusCode !== 200) console.error(error)
            else if (body !== undefined) {
                xml.parseString(body, function(err, res) {
                    if (err) console.error(err)
                    else if (res !== undefined) {
                        var output = []

                        if (res.ResultSet) {
                            try {
                                _.forEach(res.ResultSet.Result[0].WordList[0].Word, (value) => {
                                    if (value.Roman) {
                                        if (value.Roman[0] == " ") return
                                        output.push(value.Roman[0])
                                    } else if (value.Surface) {
                                        if (value.Surface[0] == " ") return
                                        output.push(value.Surface[0])
                                    } else {
                                        return
                                    }
                                })
                            } catch(e) {
                                core.error(JSON.stringify(e), "translate")
                            }
                        } else {
                            resolve(["Nil"])
                        }

                        resolve(output)
                    }
                })
            }
        })
    })
}

exports.main = (core, channel, user, args, id, event, extra) => {
    if (args.length < 1) {
        core.bot.reply(event, "Missing Args, use !help to see command usage")
        return
    }

    var lang = args[0].split(",")
    var tolang = (lang[0] == "zh") ? "zh-TW" : lang[0]
    var frlang = lang.length > 1 ? lang[1] : "auto"
    var translate = args.slice(1)
                        .join(" ")
                        .replace(/。/g, ". ")
                        .replace(/、/g, ", ")
                        .replace(/？/g, "? ")
                        .replace(/！/g, "! ")
                        .replace(/「/g, "\"")
                        .replace(/」/g, "\" ")
                        .replace(/　/g, " ")

    var fetch = {
        headers: { "User-Agent": "Mozilla/5.0" },
        url: extra.keychain.google_translate + qs.stringify({
            dt: "t", // data type
            client: "gtx", // client type
            sl: frlang, // from language
            tl: tolang, // to language
            q: translate // query
        })
    }

    request.get(fetch, (err, res, body) => {
        if (err) {
            core.bot.error(err, "translate")
            return
        } else if (res.statusCode !== 200) {
            core.bot.error(`Status Code was not 200, saw ${res.statusCode} instead`, "translate")
            return
        } else if (body.startsWith(",", 1)) {
            core.bot.error(`Malformed Response:\n${body}`, "translate")
            return
        } else if (args[0] == " " || !(args[0].split(",")[0] in langs)) {
            core.bot.error(`Unknown/Unsupported Language`, "translate")
            return
        }

        var response = JSON.parse(body.replace(/\,+/g, ","))
        var translation = response[0][0][0]
        var query       = (typeof response[0][0][1] === "string") ? response[0][0][1] : translate
        var from_lang   = response[1]
        var to_lang     = tolang
        var to_roma     = (tolang == "ja") ? translation : query

        var from_fancy = check_iso(from_lang)
        var to_fancy   = check_iso(to_lang)
        var other = ""

        if (response[3]) {
            if (response[3][0]) {
                _.forEach(response[3][0], (value) => {
                    other += check_iso(value)
                })
            }
        }

        var format = [`**${from_fancy}:** ${query}`, `**${to_fancy}:** ${translation.toUpperLowerCase()}`]

        if (to_lang === "ja" || from_lang === "ja") {
            romaji(core, extra.keychain, to_roma, channel).then((furigana) => {
                var format_roma = `**Romaji:** ${furigana.join("")}`

                if (from_lang === "ja") format.splice(1, 0, format_roma)
                else if (to_lang === "ja") format.push(format_roma)

                core.post({
                    channel: channel,
                    message: `\n${format.join("\n")}`,
                    author: extra.user
                }, core.delete(event))
            })
        } else {
            core.post({
                channel: channel,
                message: `\n${format.join("\n")}`,
                author: extra.user
            }, core.delete(event))
        }
    })
}

"use strict"

const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const Canvas = require("canvas")
const request = require("request")

module.exports = (bot, channel, user, args, id, message, extra) => {
    let util = extra.util

    if (args.length === 0) {
        if (extra.config.aqi.hasOwnProperty(extra.trigger.id)) {
            args = extra.config.aqi[extra.trigger.id]
        } else {
            channel.sendMessage(`Sorry, you don't have permission to use this command.`)
            return
        }
    }

    // AQI ID
    if (Boolean(Number(args[0]))) {
        request("http://kurisu.pw/api/aqi?id=" + args[0], (error, response, body) => {
            try {
                body = JSON.parse(body)
            } catch(e) {
                console.error(e)
            }

            if (error) {
                util.error(error, "aqi", channel)
                return
            } else if (!body.ok) {
                if (body.debug)
                    console.error(body.debug)
                util.error(body.error, "aqi", channel)
                return
            } else if (response.statusCode !== 200) {
                if (response.statusCode === 504)
                    util.error("Sorry, the API took too long to respond. Try again?", "aqi", channel)
                else
                    util.error(response.statusCode, "aqi", channel)
                return
            }

            console.log(chalk.magenta.bold("Location:"), chalk.magenta(body.location.place))
            console.log(chalk.magenta.bold("Quality:"), chalk.magenta(body.aqi.level))
            console.log(chalk.magenta.bold("Index:"), chalk.magenta(body.aqi.index))

            /*extra.util.webhook("midori", {
                "username": extra.hook.bot.username,
                "icon_url": extra.hook.bot.icon,
                "attachments": [
                    {
                        "author_name": extra.hook.user.username,
                        "author_icon": extra.hook.user.icon,
                        "color": body.aqi.color,
                        "text": " ",
                        "fields": [
                            {
                                "title": "Location",
                                "value": body.location.place
                            },
                            {
                                "title": "Index",
                                "value": body.aqi.value,
                                "short": true
                            },
                            {
                                "title": "Level",
                                "value": body.aqi.level,
                                "short": true
                            }
                        ]
                    }
                ]
            })*/

            let canvas = new Canvas(400, 100)
            let ctx = canvas.getContext("2d")

            let Font = Canvas.Font
            let Image = Canvas.Image

            let generate = () => {
                let Roboto = new Font("Roboto", path.join(__dirname, "./Roboto.ttf"))
                let base = new Image()
                    base.src = path.join(__dirname, "./base.png")

                // Environment Variables
                ctx.drawImage(base, 0, 0)
                ctx.scale(1, 1)
                ctx.patternQuality = "bilinear"
                ctx.filter = "bilinear"
                ctx.antialias = "subpixel"
                ctx.fillStyle = "#000000"

                // Place
                ctx.font = "20px Roboto"
                ctx.fillText(body.location.place, 25, 41)

                // Condition
                ctx.font = "18px Roboto"
                ctx.fillStyle = body.aqi.color
                ctx.fillText(body.aqi.level, 25, 68)

                // Value
                ctx.font = "60px Roboto"
                ctx.fillStyle = body.aqi.color
                ctx.textAlign = "right"
                ctx.fillText(body.aqi.value, 370, 67)

                // Send
                channel.sendFile(canvas.toBuffer())
                    //.then(msg => message.delete())
                    .catch(error => util.error(error, "aqi", channel))
            }

            generate()
        })
    } else {
        channel.sendMessage(`Sorry, that's not a valid ID.`)
    }
}

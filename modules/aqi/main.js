"use strict"

const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const Canvas = require("canvas")
const request = require("request")

// search
// https://wind.waqi.info/nsearch/full/{QUERY}

// autolocate (from user's ip)
// http://aqicn.org/aqicn/services/geolocate/?autolocate&lurlv2&lang=en

// feed
// https://waqi.info/api/feed/@{ID}/now.json
// https://waqi.info/api/feed/@{ID}/obs.en.json

// widget
// https://waqi.info/api/widget/{ID}/widget.v1.json

let defs = {
    "3255": "St Marys, Sydney, Australia",
    "7021": "Kolkata, India",
    "8259": "Manila, Philippines"
}

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
        request({ headers: { "User-Agent": "Mozilla/5.0" }, url: `https://waqi.info/api/widget/${args[0]}/widget.v1.json` }, (error, response, body) => {
            if (error) {
                console.error(error)
                return
            } else if (response.statusCode !== 200) {
                console.error(response.statusCode)
                return
            }

            body = JSON.parse(body)
            let sauce = body.rxs.obs[0].msg
            //console.log(JSON.stringify(body, null, 4))

            let data = {
                value: sauce.model.aqi,
                location: args[0] in defs ? defs[args[0]] : sauce.model.city.name,
                title: "Unknown",
                index: -1,
                style: "#444444"
            }

            if (data.value > 0 && data.value <= 25) {
                data.index = 0
                data.title = "Very Good"
                data.style = "#1D87E4"
            } else if (data.value >= 26 && data.value <= 50) {
                data.index = 1
                data.title = "Good"
                data.style = "#4CAF50"
            } else if (data.value >= 51 && data.value <= 99) {
                data.index = 2
                data.title = "Fair"
                data.style = "#FAA800"
            } else if (data.value >= 100 && data.value <= 149) {
                data.index = 3
                data.title = "Poor"
                data.style = "#E53935"
            } else if (data.value >= 150 && data.value <= 199) {
                data.index = 4
                data.title = "Very Poor"
                data.style = "#BB1410"
            } else if (data.value >= 200) {
                data.index = 5
                data.title = "Hazardous"
                data.style = "#7D57C1"
            } else {
                data.index = -1
                data.title = "Unknown"
                data.style = "#444444"
            }

            console.log(chalk.magenta.bold("Location:"), chalk.magenta(data.location))
            console.log(chalk.magenta.bold("Quality:"), chalk.magenta(data.title))
            console.log(chalk.magenta.bold("Index:"), chalk.magenta(data.value))

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
                ctx.fillText(data.location, 25, 41)

                // Condition
                ctx.font = "18px Roboto"
                ctx.fillStyle = data.style
                ctx.fillText(data.title, 25, 68)

                // Value
                ctx.font = "60px Roboto"
                ctx.fillStyle = data.style
                ctx.textAlign = "right"
                ctx.fillText(data.value, 370, 67)

                // Send
                channel.sendFile(canvas.toBuffer())
                    .then(msg => message.delete())
                    .catch(error => util.error(error, "aqi", channel))
            }

            generate()
        })
    // Search
    } else {
        request({ headers: { "User-Agent": "Mozilla/5.0" }, url: "https://wind.waqi.info/nsearch/full/" + args.join(" ") }, (error, response, body) => {
            if (error) {
                console.error(error)
                return
            } else if (response.statusCode !== 200) {
                console.error(response.statusCode)
                return
            }

            body = typeof body === "object" ? body : JSON.parse(body)

            if (body.results.length > 0) {
                let results = []
                body.results.forEach((i) => {
                    results.push(`${i.x}: ${i.n[0]}`)
                })

                channel.sendMessage(`Results:\n\`\`\`${results.join("\n")}\`\`\``)
            } else {
                channel.sendMessage(`No Results for "${args.join(" ")}"`)
            }
        })
    }
}

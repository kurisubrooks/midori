"use strict"

const chalk = require("chalk")
const Canvas = require("canvas")
const request = require("request")
const moment = require("moment")
const path = require("path")
const fs = require("fs")

module.exports = (bot, channel, user, args, id, event, extra) => {
    const util = extra.util

    // Parse JSON
    let data = {
        "latitude": -33.75,
        "longitude": 150.7,
        "timezone": "Australia/Sydney",
        "offset": 10,
        "currently": {
            "time": 1472355465,
            "summary": "Apocalypse",
            "icon": "thunderstorm",
            "precipIntensity": 1,
            "precipProbability": 1,
            "temperature": 56.03,
            "apparentTemperature": 74.90,
            "dewPoint": 3.41,
            "humidity": 1,
            "windSpeed": 274.64,
            "windBearing": 236,
            "cloudCover": 0,
            "pressure": 1569.51,
            "ozone": 317.62
        }
    }

    let offset = data.offset
    let geocode = "-33.75,150.7"
    let location = "Penrith NSW 2750, Australia"
    let datetime = moment().utcOffset(data.offset).format("D MMMM, h:mma")
    let localtime = data.currently.time
    let condition = data.currently.summary
    let icon = data.currently.icon
    let chanceofrain = Math.round((data.currently.precipProbability * 100) / 5) * 5
    let temperature = Math.round(data.currently.temperature * 10) / 10
    let feelslike = Math.round(data.currently.apparentTemperature * 10) / 10
    let humidity = Math.round(data.currently.humidity * 100)
    let windspeed = data.currently.windSpeed

    let canvas = new Canvas(400, 290)
    let ctx = canvas.getContext("2d")

    let Font = Canvas.Font
    let Image = Canvas.Image

    let generate = () => {
        let Roboto = new Font("Roboto", path.join(__dirname, "./fonts/Roboto.ttf"))
        let base = new Image()

        if (icon === "clear-day" || icon === "partly-cloudy-day") {
            base.src = path.join(__dirname, "./base/sun.png")
        } else if (icon === "clear-night" || icon === "partly-cloudy-night") {
            base.src = path.join(__dirname, "./base/moon.png")
        } else if (icon === "rain") {
            base.src = path.join(__dirname, "./base/rain.png")
        } else if (icon === "snow" || icon === "sleet" || icon === "fog" || icon === "wind") {
            base.src = path.join(__dirname, "./base/snow.png")
        } else if (icon === "cloudy") {
            base.src = path.join(__dirname, "./base/cloud.png")
        } else if (icon === "thunderstorm") {
            base.src = path.join(__dirname, "./base/tstorm.png")
        }

        let cond = new Image()
        cond.src = path.join(__dirname, `./icons/${icon}.png`)

        // Environment Variables
        ctx.drawImage(base, 0, 0)
        ctx.scale(1, 1)
        ctx.patternQuality = "bilinear"
        ctx.filter = "bilinear"
        ctx.antialias = "subpixel"
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)"
        ctx.shadowOffsetY = 2
        ctx.shadowBlur = 2

        // Time
        ctx.font = "12px Roboto"
        ctx.fillStyle = "#000000"
        ctx.shadowColor = "rgba(255, 255, 255, 0.4)"
        ctx.fillText(datetime, 20, 30)

        // Place
        ctx.font = "18px Roboto"
        ctx.fillStyle = "#FFFFFF"
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)"
        ctx.fillText(location, 20, 56)

        // Temperature
        ctx.font = "88px Roboto"
        ctx.fillText(`${temperature}°`, 16, 145)

        // Condition
        ctx.font = "14px Roboto"
        ctx.textAlign = "center"
        ctx.fillText(condition, 328, 148)

        // Condition Image
        ctx.shadowBlur = 5
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
        ctx.drawImage(cond, 276, 22, 105, 105)

        // Details
        ctx.font = "14px Roboto"
        ctx.shadowColor = "rgba(0, 0, 0, 0)"
        ctx.textAlign = "left"
        ctx.fillStyle = "#000000"
        ctx.fillText("Current details", 20, 194)

        // Titles
        ctx.font = "14px Roboto"
        ctx.fillStyle = "#777777"
        ctx.fillText("Humidity", 20, 220)
        ctx.fillText("Wind Speed", 20, 240)
        ctx.fillText("Chance of rain", 20, 260)

        // Values
        ctx.font = "14px Roboto"
        ctx.fillStyle = "#000000"
        ctx.fillText(`${humidity}%`, 170, 220)
        ctx.fillText(`${windspeed} km/h`, 170, 240)
        ctx.fillText(`${chanceofrain}%`, 170, 260)

        // Save
        bot.sendFile(channel, canvas.toBuffer(), (err) => {
            if (err) {
                util.error(err, "weather", channel)
                return
            }

            bot.deleteMessage(event)
        })

        // Debug
        console.log(chalk.magenta.bold("Location:"), chalk.magenta(location), chalk.magenta(`[${geocode}]`))
        console.log(chalk.magenta.bold("Base:"), chalk.magenta(base.src))
        console.log(chalk.magenta.bold("Icon:"), chalk.magenta(icon))
        console.log(chalk.magenta.bold("Temperature:"), chalk.magenta(`${temperature}°`), chalk.magenta(`(${feelslike}°)`))
        console.log(chalk.magenta.bold("Rain Chance:"), chalk.magenta(`${chanceofrain}%`))
        console.log(chalk.magenta.bold("Humidity"), chalk.magenta(`${humidity}%`))
    }

    generate()
}

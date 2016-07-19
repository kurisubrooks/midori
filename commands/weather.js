// nano²
"use strict"

const _ = require("lodash")
const fs = require("fs")
const path = require("path")
const moment = require("moment")
const request = require("request")
const Canvas = require("canvas")
const config = require("../config")

exports.main = (core, channel, user, args, id, event, extra) => {
    if (args.length === 0) {
        if (config.weather.hasOwnProperty(extra.trigger.id)) {
            args = config.weather[extra.trigger.id]
        } else {
            core.post({ channel: channel, author: extra.user, message: "Missing Query" }); return
        }
    }

    var key = extra.keychain.wunderground
    var query = encodeURIComponent(args.join(" "))

    var urls = {
        cycle:   `http://api.wunderground.com/api/${key}/astronomy/q/${query}.json`,
        current: `http://api.wunderground.com/api/${key}/conditions/q/${query}.json`,
        hourly:  `http://api.wunderground.com/api/${key}/hourly/q/${query}.json`
    }

    request.get({ url: urls.current }, (error, response) => {
        if (error) {
            core.post({ channel: channel, author: extra.user, message: JSON.stringify(error) }); return
        }

        else if (response.statusCode !== 200) {
            core.post({ channel: channel, author: extra.user, message: `Unknown Error, Malformed Request or other API Error. [${response.statusCode}]` }); return
        }

        var res = JSON.parse(response.body).response

        if (res.error) {
            core.post({ channel: channel, author: extra.user, message: res.error.description }); return
        }

        else if (res.results) {
            core.post({ channel: channel, author: extra.user, message: "Too many results returned from your query.\nTry refining your query, example: `City, State, Country`" }); return
        }

        var result = JSON.parse(response.body).current_observation

        var place = result.display_location.full
        var timezone = result.local_tz_offset
        var datetime = moment().utcOffset(timezone).format("D MMMM, h:mma") // 19 July, 4:57am
        var temperature = result.temp_c
        var condition = result.weather
        var feelslike = result.feelslike_c
        var humidity = result.relative_humidity
        var windspeed = result.wind_kph

        var cycle = function() {
            var time = moment().utcOffset(timezone).format("HH")
            return (time < 6 || time >= 18) ? "night" : "day"

            /*return new Promise((resolve, reject) => {
                request.get({ url: urls.cycle }, (error, response) => {
                    if (error) {
                        core.post({ channel: channel, author: extra.user, message: JSON.stringify(error) }); return
                    }

                    else if (response.statusCode !== 200) {
                        core.post({ channel: channel, author: extra.user, message: `Unable to get Date/Time/Daylight Cycle: Unknown Error, Malformed Request or other API Error. [${response.statusCode}]` }); return
                    }

                    var res = JSON.parse(response.body).response

                    console.log("cycle get res")
                    console.log(res)

                    if (res.error) {
                        core.post({ channel: channel, author: extra.user, message: res.error.description }); return
                    }

                    var result = JSON.parse(response.body).moon_phase

                    console.log("cycle moon phase res")
                    console.log(result)

                    var now = `${Number(result.current_time.hour)}${Number(result.current_time.minute)}`
                    var sunrise = `${Number(result.sunrise.hour)}${Number(result.sunrise.minute)}`
                    var sunset = `${Number(result.sunset.hour)}${Number(result.sunset.minute)}`

                    console.log(sunrise)

                    if (now > sunrise && now < sunset) {
                        resolve("day")
                    } else {
                        resolve("night")
                    }
                })
            })*/
        }

        var icon = function(cycle) {
            var code = result.icon.toLowerCase()

                 if (code == "chanceflurries")                      return "flurries"
            else if (code == "chancerain")                          return "showers_rain"
            else if (code == "chancesleat")                         return "wintry_mix_rain_snow"
            else if (code == "chancesnow")                          return "snow_showers_snow"
            else if (code == "chancetstorms" && cycle == "day")     return "isolated_scattered_tstorms_day"
            else if (code == "chancetstorms" && cycle == "night")   return "isolated_scattered_tstorms_night"
            else if (code == "clear" && cycle == "day")             return "sunny"
            else if (code == "clear" && cycle == "night")           return "clear_night"
            else if (code == "cloudy")                              return "cloudy"
            else if (code == "flurries")                            return "flurries"
            else if (code == "fog")                                 return "haze_fog_dust_smoke"
            else if (code == "hazy")                                return "haze_fog_dust_smoke"
            else if (code == "mostlycloudy" && cycle == "day")      return "mostly_cloudy_day"
            else if (code == "mostlycloudy" && cycle == "night")    return "mostly_cloudy_night"
            else if (code == "mostlysunny")                         return "mostly_sunny"
            else if (code == "partlycloudy" && cycle == "day")      return "partly_cloudy"
            else if (code == "partlycloudy" && cycle == "night")    return "partly_cloudy_night"
            else if (code == "partlysunny")                         return "partly_cloudy"
            else if (code == "rain")                                return "showers_rain"
            else if (code == "sleat")                               return "wintry_mix_rain_snow"
            else if (code == "snow")                                return "snow_showers_snow"
            else if (code == "sunny")                               return "sunny"
            else if (code == "tstorms" && cycle == "day")           return "isolated_scattered_tstorms_day"
            else if (code == "tstorms" && cycle == "night")         return "isolated_scattered_tstorms_night"
            else if (code == "unknown")                             return "unknown"
            else                                                    return "unknown"
        }

        var resource = function(input) {
            return path.join(__dirname, "../", "resources", "weather", input)
        }

        var main = function() {
            const canvas = new Canvas(400, 290)
            const ctx = canvas.getContext("2d")

            const Image = Canvas.Image
            const Font = Canvas.Font

            var daynight = cycle()

            var Roboto = new Font("Roboto", resource("fonts/Roboto.ttf"))
                Roboto.addFace(resource("fonts/Roboto Light.ttf"), "300")
                Roboto.addFace(resource("fonts/Roboto Regular.ttf"), "400")
                Roboto.addFace(resource("fonts/Roboto Medium.ttf"), "500")

            var Base = new Image()

            if (new RegExp(["chanceflurries", "chancesleat", "chancesnow", "cloudy", "flurries", "fog", "hazy", "mostlycloudy", "partlysunny", "sleat", "snow"].join("|")).test(result.icon.toLowerCase())) {
                Base.src = fs.readFileSync(resource("base/cloud.png"))
                ctx.drawImage(Base, 0, 0)
            } else if (new RegExp(["chancerain", "chancetstorms", "rain", "tstorms"].join("|")).test(result.icon.toLowerCase())) {
                Base.src = fs.readFileSync(resource("base/rain.png"))
                ctx.drawImage(Base, 0, 0)
            } else if (daynight == "day") {
                Base.src = fs.readFileSync(resource("base/sun.png"))
                ctx.drawImage(Base, 0, 0)
            } else if (daynight == "night") {
                Base.src = fs.readFileSync(resource("base/moon.png"))
                ctx.drawImage(Base, 0, 0)
            }

            ctx.addFont(Roboto)
            ctx.shadowColor = "rgba(255, 255, 255, 0.4)"
            ctx.shadowOffsetY = 2
            ctx.shadowBlur = 2
            ctx.scale(1, 1)
            ctx.patternQuality = "bilinear"
            ctx.filter = "bilinear"
            ctx.antialias = "subpixel"

            // Time
            ctx.font = "400 12px Roboto"
            ctx.fillStyle = "#000000"
            ctx.fillText(datetime, 20, 30)

            // Place
            ctx.font = "500 18px Roboto"
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)"
            ctx.fillStyle = "#FFFFFF"
            ctx.fillText(place, 20, 56)

            // Temperature
            ctx.font = "400 88px Roboto"
            ctx.fillText(temperature + "°", 16, 145)

            // Condition Image
            var con = new Image()
                con.src = fs.readFileSync(resource(`icons/${icon(daynight)}.png`))
            ctx.shadowColor = "rgba(0, 0, 0, 0)"
            ctx.drawImage(con, 276, 22, 105, 105)

            // Condition
            ctx.font = "500 14px Roboto"
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)"
            ctx.textAlign = "center"
            ctx.fillText(condition, 325, 148)

            // Details
            ctx.font = "500 14px Roboto"
            ctx.shadowColor = "rgba(0, 0, 0, 0)"
            ctx.textAlign = "left"
            ctx.fillStyle = "#000000"
            ctx.fillText("Current details", 20, 194)

            // Titles
            ctx.font = "400 14px Roboto"
            ctx.fillStyle = "#777777"
            ctx.fillText("Feels like", 20, 220)
            ctx.fillText("Humidity", 20, 240)
            ctx.fillText("Wind Speed", 20, 260)

            // Values
            ctx.font = "400 14px Roboto"
            ctx.fillStyle = "#000000"
            ctx.fillText(feelslike + "°", 170, 220)
            ctx.fillText(humidity, 170, 240)
            ctx.fillText(windspeed + " km/h", 170, 260)

            // Save Image
            var id = new Date().getTime()
            canvas.createPNGStream().pipe(fs.createWriteStream(resource(`out/${id}.png`)))

            setTimeout(function() {
                core.upload({
                    channel: channel,
                    file: path.join(__dirname, "../", "resources", "weather", "out", id + ".png")
                }, (err, res) => {
                    core.delete(event)
                    fs.unlink(path.join(__dirname, "../", "resources", "weather", "out", id + ".png"))
                })
            }, 1000)
        }

        main()
    })
}

// nano²
"use strict"

const _ = require("lodash")
const fs = require("fs")
const path = require("path")
const moment = require("moment")
const request = require("request")
const Canvas = require("canvas")

exports.main = (core, channel, user, args, id, event, extra) => {
    if (args.length === 0) {
        if (extra.config.weather.hasOwnProperty(extra.trigger.id)) {
            args = extra.config.weather[extra.trigger.id]
        } else {
            core.post({ channel: channel, author: extra.user, message: "Please provide a query" }); return
        }
    }

    var key1 = extra.keychain.wunderground1
    var key2 = extra.keychain.wunderground2
    var key3 = extra.keychain.wunderground3
    var query = encodeURIComponent(args.join(" "))

    var urls = {
        cycle:   `http://api.wunderground.com/api/${key1}/astronomy/q/${query}.json`,
        current: `http://api.wunderground.com/api/${key2}/conditions/q/${query}.json`,
        hourly:  `http://api.wunderground.com/api/${key3}/hourly/q/${query}.json`
    }

    request.get({ url: urls.current }, (error, response) => {
        if (error) {
            core.post({ channel: channel, author: extra.user, message: JSON.stringify(error) }); return
        }

        else if (response.statusCode !== 200) {
            core.post({ channel: channel, author: extra.user, message: `Unknown Error, Malformed Request or other API Error. [${response.statusCode}]` }); return
        }

        var res = JSON.parse(response.body).response

        console.log(res)

        if (res.error) {
            if (res.error.type == "keynotfound") {
                core.post({ channel: channel, author: extra.user, message: "Rate Limit Exceeded, Try again later" }); return
            }

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
            return new Promise((resolve, reject) => {
                request.get({ url: urls.cycle }, (error, response) => {
                    if (error) {
                        core.post({ channel: channel, author: extra.user, message: JSON.stringify(error) }); return
                    }

                    else if (response.statusCode !== 200) {
                        core.post({ channel: channel, author: extra.user, message: `Unable to get Date/Time/Daylight Cycle: Unknown Error, Malformed Request or other API Error. [${response.statusCode}]` }); return
                    }

                    var res = JSON.parse(response.body).response

                    if (res.error) {
                        core.post({ channel: channel, author: extra.user, message: res.error.description }); return
                    }

                    var result = JSON.parse(response.body).moon_phase

                    var now = Number(result.current_time.hour + result.current_time.minute)
                    var sunrise = Number(result.sunrise.hour + result.sunrise.minute)
                    var sunset = Number(result.sunset.hour + result.sunset.minute)

                    if (now > sunrise && now < sunset) {
                        resolve("day")
                    } else {
                        resolve("night")
                    }
                })
            })
        }

        var icon = function(cycle) {
            var code = result.icon.toLowerCase()

                 if (code == "chanceflurries")                    return ["flurries", "snow"]
            else if (code == "chancerain")                        return ["showers_rain", "showers"]
            else if (code == "chancesleat")                       return ["wintry_mix_rain_snow", "snow"]
            else if (code == "chancesnow")                        return ["snow_showers_snow", "snow"]
            else if (code == "chancetstorms" && cycle == "day")   return ["isolated_scattered_tstorms_day", "tstorm"]
            else if (code == "chancetstorms" && cycle == "night") return ["isolated_scattered_tstorms_night", "tstorm"]
            else if (code == "clear" && cycle == "day")           return ["sunny", "sun"]
            else if (code == "clear" && cycle == "night")         return ["clear_night", "moon"]
            else if (code == "cloudy")                            return ["cloudy", "cloud"]
            else if (code == "flurries")                          return ["flurries", "snow"]
            else if (code == "fog")                               return ["haze_fog_dust_smoke", "snow"]
            else if (code == "hazy")                              return ["haze_fog_dust_smoke", "snow"]
            else if (code == "mostlycloudy" && cycle == "day")    return ["mostly_cloudy_day", "cloud"]
            else if (code == "mostlycloudy" && cycle == "night")  return ["mostly_cloudy_night", "cloud"]
            else if (code == "mostlysunny")                       return ["mostly_sunny", "sun"]
            else if (code == "partlycloudy" && cycle == "day")    return ["partly_cloudy", "sun"]
            else if (code == "partlycloudy" && cycle == "night")  return ["partly_cloudy_night", "moon"]
            else if (code == "partlysunny")                       return ["partly_cloudy", "sun"]
            else if (code == "rain")                              return ["showers_rain", "rain"]
            else if (code == "sleat")                             return ["wintry_mix_rain_snow", "snow"]
            else if (code == "snow")                              return ["snow_showers_snow", "snow"]
            else if (code == "sunny")                             return ["sunny", "sun"]
            else if (code == "tstorms" && cycle == "day")         return ["isolated_scattered_tstorms_day", "tstorm"]
            else if (code == "tstorms" && cycle == "night")       return ["isolated_scattered_tstorms_night", "tstorm"]
            else if (code == "unknown")                           return ["unknown", "cloud"]
            else                                                  return ["unknown", "cloud"]
        }

        var resource = function(input) {
            return path.join(__dirname, "../", "resources", "weather", input)
        }

        var main = function() {
            const canvas = new Canvas(400, 290)
            const ctx = canvas.getContext("2d")

            const Image = Canvas.Image
            const Font = Canvas.Font

            var Roboto = new Font("Roboto", resource("fonts/Roboto.ttf"))
                Roboto.addFace(resource("fonts/Roboto Light.ttf"), "300")
                Roboto.addFace(resource("fonts/Roboto Medium.ttf"), "500")

            var NotoSans = new Font("Noto", resource("fonts/NotoSans Regular.otf"))
                NotoSans.addFace(resource("fonts/NotoSans Medium.otf"), "500")

            ctx.addFont(Roboto)
            ctx.addFont(NotoSans)
            ctx.shadowColor = "rgba(255, 255, 255, 0.4)"
            ctx.shadowOffsetY = 2
            ctx.shadowBlur = 2
            ctx.scale(1, 1)
            ctx.patternQuality = "bilinear"
            ctx.filter = "bilinear"
            ctx.antialias = "subpixel"

            var daynight = cycle().then((res) => {
                // Base Layer
                var Base = new Image()
                    Base.src = fs.readFileSync(resource(`base/${icon(res)[1]}.png`))
                    ctx.drawImage(Base, 0, 0)

                // Condition Image
                var con = new Image()
                    con.src = fs.readFileSync(resource(`icons/${icon(res)[0]}.png`))
                ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
                ctx.shadowOffsetY = 1
                ctx.shadowBlur = 5
                ctx.drawImage(con, 276, 22, 105, 105)

                // Time
                ctx.font = "500 15px Roboto"
                ctx.fillStyle = "#000"
                ctx.shadowColor = "rgba(255, 255, 255, 0.4)"
                ctx.shadowOffsetY = 2
                ctx.shadowBlur = 2
                ctx.fillText(datetime, 20, 32)

                // Place
                ctx.font = "500 18px Roboto"
                ctx.fillStyle = "#FFF"
                ctx.shadowColor = "rgba(0, 0, 0, 0.4)"
                ctx.fillText(place, 20, 56)

                // Temperature
                ctx.font = "400 88px Roboto"
                ctx.fillText(temperature + "°", 16, 145)

                // Condition
                ctx.font = "500 15px Roboto"
                ctx.textAlign = "center"
                ctx.fillText(condition, 327, 148)

                // Details
                ctx.font = "500 15px Roboto"
                ctx.shadowColor = "rgba(0, 0, 0, 0)"
                ctx.textAlign = "left"
                ctx.fillStyle = "#000"
                ctx.fillText("Current details", 20, 194)

                // Titles
                ctx.font = "400 15px Roboto"
                ctx.fillStyle = "#777"
                ctx.fillText("Feels like", 20, 220)
                ctx.fillText("Humidity", 20, 240)
                ctx.fillText("Wind Speed", 20, 260)

                // Values
                ctx.font = "400 15px Roboto"
                ctx.fillStyle = "#000"
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
                }, 500)
            })
        }

        main()
    })
}

// nano²
"use strict"

const _ = require("lodash")
const moment = require("moment")
const request = require("request")

exports.main = (core, channel, user, args, id, event, config) => {
    if (args.length === 0) args = ["penrith", "australia"]

    var options = {
        url: `https://api.wunderground.com/api/${config.keychain.wunderground}/conditions/q/${encodeURIComponent(args.join(" "))}.json`
    }

    request.get(options, (error, response) => {
        if (error) {
            core.error(JSON.stringify(error), "weather")
            return
        } else if (response.statusCode !== 200) {
            core.error("Malformed Request or API Error", "weather")
            return
        } else if (response.body.response.error) {
            core.error((JSON.stringify(response.body.response.error.description)).toUpperLowerCase(), "weather")
            return
        } else if (response.body.response.results && response.body.response.results.length > 1) {
            core.post({
                channel: channel,
                message: `Too many results for \`${args.join()}\`, please specify \`City, State, Country\``,
                author: config.user
            })
            return
        }

        var body = JSON.parse(response.body)
        var result = body.current_observation
        var location = result.display_location.full
        var offset = result.local_tz_offset
        var time = moment().utcOffset(offset).format("hh:mma")
        var icon = result.icon.toLowerCase()
        var temp = `${result.temp_c}ºC (${result.feelslike_c}º)`
        var condition = result.weather
        var humidity = result.relative_humidity
        var wind = result.wind_kph + "km/h"
        var url = `http://kurisubrooks.com/static/tenki/${cycle(offset)}/${image(icon)}.png`

        core.post({
            channel: channel,
            message: `\n**${location} (${time})**\n**Temperature:** ${temp}\n**Condition:** ${condition}\n**Humidity:** ${humidity}\n**Wind Speed:** ${wind}\n\n${url}`,
            author: config.user
        }, core.delete(id))
    })
}

function cycle(o) {
    var time = moment().utcOffset(o).format("HH");
    return (time <= 6 || time >= 19) ? "night" : "day";
}

function image(c) {
    console.log(c);
    switch(c) {
        case "chanceflurries":  return "flurry";
        case "chancerain":      return "rain";
        case "chancesleat":     return "sleet";
        case "chancesnow":      return "snow";
        case "chancetstorms":   return "thunderstorm";
        case "clear":           return "clear";
        case "cloudy":          return "cloudy";
        case "flurries":        return "flurry";
        case "fog":             return "haze";
        case "hazy":            return "haze";
        case "mostlycloudy":    return "mostly_cloudy";
        case "mostlysunny":     return "mostly_sunny";
        case "partlycloudy":    return "partly_cloudy";
        case "partlysunny":     return "partly_sunny";
        case "rain":            return "rain";
        case "sleat":           return "sleet";
        case "snow":            return "snow";
        case "sunny":           return "sunny";
        case "tstorms":         return "thunderstorm";
        case "unknown":         return "unknown";
    }
}

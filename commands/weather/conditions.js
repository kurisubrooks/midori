/* eslint-disable complexity */
const path = require("path");
const Canvas = require("canvas");
const moment = require("moment-timezone");
const request = require("request-promise");
const Command = require("../../core/Command");
const Database = require("../../core/Database");

class Weather extends Command {
    constructor(client) {
        super(client, {
            name: "Weather",
            description: "Get the Weather for your Given Location",
            aliases: ["w", "conditions"]
        });
    }

    async run(message, channel, user, args) {
        let geolocation, city, state, geocode;

        // No Args Supplied
        if (args.length === 0) {
            const userDB = await Database.Models.Users.findOne({ where: { id: user.id } });
            const err = "Please provide a query, or set your location with `/set location <location>`";

            // Check if User exists in DB
            if (userDB) {
                const data = JSON.parse(userDB.data);

                // Checks if User has a set location
                if (data.weather || data.location) {
                    console.log(data.weather);
                    city = data.weather[0];
                    state = data.weather[1];
                    geocode = data.weather[2];
                    geolocation = true;
                    this.log(`Using Cached Geolocation`, "debug");
                } else {
                    return message.reply(err);
                }
            } else {
                return message.reply(err);
            }
        }

        // Ignore geolocation request if User has set a location
        if (!geolocation) {
            const geolocation = await request({
                headers: { "User-Agent": "Mozilla/5.0" },
                uri: "https://maps.googleapis.com/maps/api/geocode/json",
                json: true,
                qs: {
                    address: encodeURIComponent(args.join("+")),
                    key: this.keychain.google.geocode
                }
            }).catch(error => this.error(error.response.body.error, channel));

            // Handle Errors
            if (!geolocation) return false;
            if (geolocation.status !== "OK") return this.handleNotOK(channel, geolocation);
            if (geolocation.results.length > 1) {
                let places = [];

                for (const val of geolocation.results) {
                    places.push(`\`${val.formatted_address}\``);
                }

                return message.reply(`Too many results, please refine your search:\n${places.join(", ")}`);
            }

            const place = geolocation.results[0].address_components;
            const locality = place.find(elem => elem.types.includes("locality"));
            const governing = place.find(elem => elem.types.includes("administrative_area_level_1"));
            const country = place.find(elem => elem.types.includes("country"));
            const continent = place.find(elem => elem.types.includes("continent"));

            console.log(place);

            /*
            if natural_feature -> +natural_feature
            elseif point_of_interest -> +point_of_interest
            elseif locality -> +locality
            elseif ward -> +ward
            else
                if administrative_area_level_3 -> +administrative_area_level_3,
                if administrative_area_level_2 -> +administrative_area_level_2

            if administrative_area_level_1 -> +administrative_area_level_1
            if country -> +country
            */

            city = locality || governing || country || continent || {};
            state = locality && governing ? governing : locality ? country : {};
            geocode = [geolocation.results[0].geometry.location.lat, geolocation.results[0].geometry.location.lng];

            this.log(`Geolocation Retrieved`, "debug");
        }

        // Get Weather
        const weather = await request({
            headers: { "User-Agent": "Mozilla/5.0" },
            uri: `https://api.darksky.net/forecast/${this.keychain.darksky}/${geocode.join(",")}`,
            json: true,
            qs: { units: "si", excludes: "minutely,hourly,alerts" }
        }).catch(error => this.error(error.response.body.error, channel));

        if (!weather) return false;

        // console.log(weather);

        const locale = weather.flags.units === "us" ? "F" : "C";
        const condition = weather.currently.summary;
        const icon = weather.currently.icon;
        const temperature = Math.round(weather.currently.temperature);
        const datetime = moment().tz(weather.timezone).format("h:mma");
        const forecast = weather.daily.data;

        this.log(`${temperature}°${locale}, ${condition}`, "debug");

        Canvas.registerFont(path.join(__dirname, "fonts", "Roboto.ttf"), { family: "Roboto" });
        Canvas.registerFont(path.join(__dirname, "fonts", "NexaBold.otf"), { family: "Nexa Bold" });

        // Generate Response Image
        const canvas = new Canvas(400, 250);
        const ctx = canvas.getContext("2d");
        const { Image } = Canvas;
        const base = new Image();
        const cond = new Image();
        const day1 = new Image();
        const day2 = new Image();

        base.src = path.join(__dirname, "base", `${this.getBaseImage(icon)}.png`);
        cond.src = path.join(__dirname, "icons", `${this.getConditionImage(icon)}.png`);
        day1.src = path.join(__dirname, "icons", `${this.getConditionImage(forecast[1].icon)}.png`);
        day2.src = path.join(__dirname, "icons", `${this.getConditionImage(forecast[2].icon)}.png`);

        // Environment Variables
        ctx.drawImage(base, 0, 0);
        ctx.scale(1, 1);
        ctx.patternQuality = "bilinear";
        ctx.filter = "bilinear";
        ctx.antialias = "subpixel";

        // City Name
        ctx.font = "20px Roboto";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(city.long_name ? city.long_name : "Unknown", 28, 40);

        // State/Prefecture Name
        ctx.font = "16px Roboto";
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fillText(state.long_name ? state.long_name : "", 28, 63);

        // Temperature
        ctx.font = "bold 34px 'Nexa Bold'";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(`${temperature}°C`, 28, 146);

        // Local Time
        ctx.textAlign = "right";
        ctx.font = "16px Roboto";
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fillText(datetime, 375, 122);

        // Condition
        ctx.font = "16px Roboto";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(condition, 375, 145);
        ctx.drawImage(cond, 318, 20);

        // Forecast Day 1
        ctx.textAlign = "left";
        ctx.font = "16px Roboto";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(moment.unix(forecast[1].time).format("dddd"), 28, 193);
        ctx.textAlign = "right";
        ctx.fillText(`${Math.round(forecast[1].temperatureMax)}°${locale}`, 340, 193);
        ctx.drawImage(day1, 350, 175, 24, 24);

        // Forecast Day 2
        ctx.textAlign = "left";
        ctx.font = "16px Roboto";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(moment.unix(forecast[2].time).format("dddd"), 28, 220);
        ctx.textAlign = "right";
        ctx.fillText(`${Math.round(forecast[2].temperatureMax)}°${locale}`, 340, 220);
        ctx.drawImage(day2, 350, 203, 24, 24);

        // Send
        await channel.sendFile(canvas.toBuffer());
        return this.delete(message);
    }

    // Get Image
    getConditionImage(input) {
        const icons = {
            "clear-day": "Day",
            "clear-night": "Night",
            "cloudy": "Cloudy",
            "flurries": "Snow",
            "fog": "Particles",
            "partly-cloudy-day": "Day_Partly_Cloudy",
            "partly-cloudy-night": "Night_Partly_Cloudy",
            "rain": "Rain",
            "sleet": "Snow",
            "snow": "Snow",
            "thunderstorm": "Thunderstorm",
            "unknown": "Unknown"
        };

        return icons[input] || "Unknown";
    }

    // Get Background Image based on Weather Condition
    getBaseImage(input) {
        if (input === "clear-day" || input === "partly-cloudy-day" || input === "cloudy") {
            return "day";
        } else if (input === "clear-night" || input === "partly-cloudy-night") {
            return "night";
        } else if (input === "rain" || input === "thunderstorm") {
            return "rain";
        } else if (input === "snow" || input === "sleet" || input === "flurries") {
            return "snow";
        } else {
            return "day";
        }
    }

    // Handle Geolocation API Errors
    handleNotOK(channel, geolocation) {
        if (geolocation.status === "ZERO_RESULTS") {
            return this.error("Query returned no results", channel);
        } else if (geolocation.status === "REQUEST_DENIED") {
            return this.error("Geocode API Request was denied", channel);
        } else if (geolocation.status === "INVALID_REQUEST") {
            return this.error("Invalid Request", channel);
        } else if (geolocation.status === "OVER_QUERY_LIMIT") {
            return this.error("Query Limit Exceeed, try again tomorrow.", channel);
        } else {
            return this.error("Unknown API Error", channel);
        }
    }
}

module.exports = Weather;

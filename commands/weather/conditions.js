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
        let geolocation, line1, found1, line2, geocode, ping;

        // Check for Pinged user
        for (let index = 0; index < args.length; index++) {
            const userMatched = /<@!?([0-9]+)>/g.exec(args[index]);

            if (userMatched && userMatched.length > 1) {
                ping = message.guild.members.get(userMatched[1]);
                args.splice(index, 1);
            }
        }

        // No Args Supplied
        if (args.length === 0 && !ping) {
            const userDB = await Database.Models.Users.findOne({ where: { id: user.id } });
            const err = "Please provide a query, or set your location with `/set location <location>`";

            // Check if User exists in DB
            if (userDB) {
                const data = JSON.parse(userDB.data);

                // Checks if User has a set location
                if (data.weather || data.location) {
                    line1 = data.weather[0].long_name;
                    line2 = data.weather[1].long_name;
                    geocode = data.weather[2];
                    geolocation = true;
                    this.log(`Using Cached Geolocation (${line1}, ${line2})`, "debug");
                } else {
                    return message.reply(err);
                }
            } else {
                return message.reply(err);
            }
        }

        // If Pinged User
        if (ping) {
            const userDB = await Database.Models.Users.findOne({ where: { id: ping.id } });

            // Check if User exists in DB
            if (userDB) {
                const data = JSON.parse(userDB.data);

                // Checks if User has a set location
                if (data.weather || data.location) {
                    line1 = data.weather[0].long_name;
                    line2 = data.weather[1].long_name;
                    geocode = data.weather[2];
                    geolocation = true;
                    this.log(`Using Cached Geolocation (${line1}, ${line2})`, "debug");
                } else {
                    return message.reply("This user has not set their location.");
                }
            } else {
                return message.reply("User was not found in database.");
            }
        }

        // Ignore geolocation request if User has set a location
        if (!geolocation) {
            const geolocation = await request({
                headers: { "User-Agent": "Mozilla/5.0" },
                uri: "https://maps.googleapis.com/maps/api/geocode/json",
                json: true,
                qs: {
                    address: args.join("+"),
                    key: this.keychain.google.geocode
                }
            }).catch(error => this.error(error.response.body.error, channel));

            // console.log(geolocation);

            // Handle Errors
            if (!geolocation) return false;
            if (geolocation.status !== "OK") return this.handleNotOK(channel, geolocation);
            if (geolocation.results.length > 1) {
                let places = [];

                this.log("Too Many Results", "debug");

                for (const val of geolocation.results) {
                    places.push(`\`${val.formatted_address}\``);
                }

                return message.reply(`Too many results were returned!\nHere's some of the returned results, please try to narrow it down for me...\n${places.join(", ")}`);
            }

            const place = geolocation.results[0].address_components;
            const find = locality => place.find(elem => elem.types.includes(locality));

            if (find("neighborhood")) {
                line1 = find("neighborhood").long_name;
            } else if (find("natural_feature")) {
                line1 = find("natural_feature").long_name;
            } else if (find("point_of_interest")) {
                line1 = find("point_of_interest").long_name;
            } else if (find("locality")) {
                line1 = find("locality").long_name;
            } else if (find("ward")) {
                line1 = find("ward").long_name;
            } else if (find("administrative_area_level_3")) {
                line1 = find("administrative_area_level_3").long_name;
            } else if (find("administrative_area_level_2")) {
                line1 = find("administrative_area_level_2").long_name;
            } else if (find("administrative_area_level_1")) {
                line1 = find("administrative_area_level_1").long_name;
                found1 = 1;
            } else if (find("country")) {
                line1 = find("country").long_name;
                found1 = 2;
            } else if (find("continent")) {
                line1 = find("continent").long_name;
                found1 = 3;
            } else {
                line1 = "Unknown";
            }

            if (find("administrative_area_level_1") && line1 !== find("administrative_area_level_1").long_name && found1 !== 1) {
                line2 = find("administrative_area_level_1").long_name;
            } else if (find("country") && line1 !== find("country").long_name && found1 !== 2) {
                line2 = find("country").long_name;
            } else if (find("continent") && line1 !== find("continent").long_name && found1 !== 3) {
                line2 = find("continent").long_name;
            } else {
                line2 = "";
            }

            if (line1.length > 25) line1 = `${line1.slice(0, 25)}...`;
            if (line2.length > 40) line2 = `${line2.slice(0, 40)}...`;

            geocode = [geolocation.results[0].geometry.location.lat, geolocation.results[0].geometry.location.lng];

            this.log(`Geolocation Retrieved`, "debug");
        }

        const murica = args.indexOf("-f") > -1;

        // Get Weather
        const weather = await request({
            headers: { "User-Agent": "Mozilla/5.0" },
            uri: `https://api.darksky.net/forecast/${this.keychain.darksky}/${geocode.join(",")}`,
            json: true,
            qs: {
                units: murica ? "us" : "si",
                excludes: "minutely,hourly,alerts"
            }
        }).catch(error => this.error(error.response.body.error, channel));

        // console.log(weather);

        if (!weather) return false;

        const locale = weather.flags.units === "us" ? "F" : "C";
        const condition = weather.currently.summary;
        const icon = weather.currently.icon;
        const temperature = Math.round(weather.currently.temperature);
        const datetime = moment().tz(weather.timezone).format("h:mma");
        const forecast = weather.daily.data;

        this.log(`${line1}, ${line2}: ${temperature}°${locale}, ${condition}, ${datetime}`, "debug");

        Canvas.registerFont(path.join(__dirname, "fonts", "Roboto.ttf"), { family: "Roboto" });
        Canvas.registerFont(path.join(__dirname, "fonts", "Rubik.ttf"), { family: "Rubik" });

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
        ctx.fillText(line1, 28, 40);

        // State/Prefecture Name
        ctx.font = "16px Roboto";
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fillText(line2, 28, 63);

        // Temperature
        ctx.font = "bold 34px Rubik";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(`${temperature}°C`, 29, 146);

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
        ctx.font = "16px Rubik";
        ctx.fillText(`${Math.round(forecast[1].temperatureMax)}°${locale}`, 340, 193);
        ctx.drawImage(day1, 350, 175, 24, 24);

        // Forecast Day 2
        ctx.textAlign = "left";
        ctx.font = "16px Roboto";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(moment.unix(forecast[2].time).format("dddd"), 28, 220);
        ctx.textAlign = "right";
        ctx.font = "16px Rubik";
        ctx.fillText(`${Math.round(forecast[2].temperatureMax)}°${locale}`, 340, 220);
        ctx.drawImage(day2, 350, 201, 24, 24);

        // Send
        await channel.send({ files: [{ attachment: canvas.toBuffer(), url: "weather.png" }] });
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
            "unknown": "Unknown",
            "wind": "Windy"
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

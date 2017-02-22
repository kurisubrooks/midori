const path = require("path");
const Canvas = require("canvas");
const request = require("superagent");
const Command = require("../../core/Command");
const { Users } = require("../../core/Models");

module.exports = class WeatherCommand extends Command {
    constructor(client) {
        super(client, {
            name: "weather",
            description: "Get the Weather for your Given Location",
            aliases: ["w"]
        });
    }

    async run(message, channel, user, args) { // eslint-disable-line complexity
        let geolocation, weather, city, state, geocode;

        if (args.length === 0) {
            const userDB = await Users.findOne({ where: { id: user.id } });
            const err = "Please provide a query, or set your location with `/set weather <location>`";

            if (userDB) {
                const data = JSON.parse(userDB.data);

                if (data.weather || data.location) {
                    city = data.weather[0];
                    state = data.weather[1];
                    geocode = data.weather[2];
                    geolocation = true;
                } else {
                    return message.reply(err);
                }
            } else {
                return message.reply(err);
            }
        }

        if (!geolocation) {
            try {
                geolocation = await request
                    .get(`https://maps.googleapis.com/maps/api/geocode/json`)
                    .query(`address=${encodeURIComponent(args.join("+"))}`)
                    .query(`key=${this.keychain.google.geocode}`);
            } catch(err) {
                this.log(err, "fatal", true);
                return this.error(err, channel);
            }

            // Handle Errors
            if (geolocation.body.status !== "OK") return this.handleNotOK(channel, geolocation.body);
            if (geolocation.body.results.length > 1) {
                let places = [];

                for (const val of geolocation.body.results) {
                    places.push(`\`${val.formatted_address}\``);
                }

                return message.reply(`Too many results, please refine your search:\n${places.join(", ")}`);
            }

            const locality = geolocation.body.results[0].address_components.find(elem => elem.types.includes("locality"));
            const governing = geolocation.body.results[0].address_components.find(elem => elem.types.includes("administrative_area_level_1"));
            const country = geolocation.body.results[0].address_components.find(elem => elem.types.includes("country"));
            const continent = geolocation.body.results[0].address_components.find(elem => elem.types.includes("continent"));

            city = locality || governing || country || continent || {};
            state = locality && governing ? governing : locality ? country : {};
            geocode = [geolocation.body.results[0].geometry.location.lat, geolocation.body.results[0].geometry.location.lng];

            this.log(`Geolocation Retrieved`, "debug");
        }

        try {
            weather = await request
                .get(`https://api.darksky.net/forecast/${this.keychain.darksky}/${geocode.join(",")}`)
                .query(`units=si`);
        } catch(err) {
            this.log(err, "fatal", true);
            return this.error(err, channel);
        }

        const condition = weather.body.currently.summary;
        const icon = weather.body.currently.icon;
        const chanceofrain = Math.round((weather.body.currently.precipProbability * 100) / 5) * 5;
        const temperature = Math.round(weather.body.currently.temperature);
        const humidity = Math.round(weather.body.currently.humidity * 100);

        this.log(`${temperature}°C, ${condition}, ${humidity}%`, "debug");

        Canvas.registerFont(path.join(__dirname, "fonts", "Roboto-Regular.ttf"), { family: "Roboto" });
        Canvas.registerFont(path.join(__dirname, "fonts", "RobotoCondensed-Regular.ttf"), { family: "Roboto Condensed" });
        Canvas.registerFont(path.join(__dirname, "fonts", "RobotoMono-Light.ttf"), { family: "Roboto Mono" });

        const canvas = new Canvas(400, 180);
        const ctx = canvas.getContext("2d");
        const { Image } = Canvas;
        const base = new Image();
        const cond = new Image();
        const humid = new Image();
        const precip = new Image();

        let theme = "light";
        let fontColour = "#FFFFFF";

        if (this.getBaseImage(icon) === "snow") {
            theme = "dark";
            fontColour = "#444444";
        }

        base.src = path.join(__dirname, "base", `${this.getBaseImage(icon)}.png`);
        cond.src = path.join(__dirname, "icons", theme, `${icon}.png`);
        humid.src = path.join(__dirname, "icons", theme, "humidity.png");
        precip.src = path.join(__dirname, "icons", theme, "precip.png");

        // Environment Variables
        ctx.drawImage(base, 0, 0);
        ctx.scale(1, 1);
        ctx.patternQuality = "bilinear";
        ctx.filter = "bilinear";
        ctx.antialias = "subpixel";

        // City Name
        ctx.font = "20px Roboto";
        ctx.fillStyle = fontColour;
        ctx.fillText(city.long_name ? city.long_name : "Unknown", 35, 50);

        // State/Prefecture Name
        ctx.font = "16px Roboto";
        ctx.fillStyle = theme === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)";
        ctx.fillText(state.long_name ? state.long_name : "", 35, 72.5);

        // Temperature
        ctx.font = "48px 'Roboto Mono'";
        ctx.fillStyle = fontColour;
        ctx.fillText(`${temperature}°`, 35, 140);

        // Condition
        ctx.textAlign = "right";
        ctx.font = "16px Roboto";
        ctx.fillText(condition, 370, 142);

        // Images
        ctx.drawImage(cond, 325, 31);
        ctx.drawImage(humid, 358, 88);
        ctx.drawImage(precip, 358, 108);

        ctx.font = "16px 'Roboto Condensed'";
        ctx.fillText(`${humidity}%`, 353, 100);
        ctx.fillText(`${chanceofrain}%`, 353, 121);

        // Send
        await channel.sendFile(canvas.toBuffer());
        return message.delete();
    }

    getBaseImage(input) {
        if (input === "clear-day" || input === "partly-cloudy-day") {
            return "day";
        } else if (input === "clear-night" || input === "partly-cloudy-night") {
            return "night";
        } else if (input === "rain") {
            return "rain";
        } else if (input === "thunderstorm") {
            return "night";
        } else if (input === "snow" || input === "sleet" || input === "fog") {
            return "snow";
        } else if (input === "wind" || input === "tornado") {
            return "windy";
        } else if (input === "cloudy") {
            return "cloudy";
        } else {
            return "cloudy";
        }
    }

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
};

"use strict";

const chalk = require("chalk");
const Canvas = require("canvas");
const request = require("request");
const path = require("path");

module.exports = (bot, channel, user, args, id, message, extra) => {
    let util = extra.util;

    if (args.length === 0) {
        if (extra.trigger.id in extra.config.weather) {
            args = extra.config.weather[extra.trigger.id];
        } else {
            return channel.sendMessage(`Please provide a query`)
                .catch(error => util.error(error));
        }
    }

    let location = encodeURIComponent(args.join("+"));
    let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${extra.keychain.google.geocode}`;

    request(url, (error, response, body) => {
        // Handle Request Errors
        if (error) {
            return util.error(error, "weather", channel);
        }

        // Parse JSON
        let data = JSON.parse(body);

        // Handle API Errors
        if (data.status !== "OK") {
            console.log(data);

            if (data.status === "ZERO_RESULTS") {
                return util.error("Error: Request returned no results", "weather", channel);
            } else if (data.status === "REQUEST_DENIED") {
                return util.error("Error: Geocode API Request was denied", "weather", channel);
            } else if (data.status === "INVALID_REQUEST") {
                return util.error("Error: Invalid Request", "weather", channel);
            } else if (data.status === "OVER_QUERY_LIMIT") {
                return util.error("Error: Query Limit Exceeded. Try again tomorrow :(", "weather", channel);
            } else if (data.status === "UNKNOWN_ERROR") {
                return util.error("Error: Unknown", "weather", channel);
            }
        }

        // Handle Multiple Results
        if (data.results.length > 1) {
            let places = [];
            data.results.forEach(val => places.push(`\`${val.formatted_address}\``));

            channel.sendMessage(`Did you mean: ${places.join(", ")}`, err => {
                if (err) util.error(err);
            });

            return null;
        }

        // Run
        if (data.results.length === 1) {
            let previous = data;
            let city, state;

            let locality = previous.results[0].address_components.find(elem => elem.types.includes("locality"));
            let governing = previous.results[0].address_components.find(elem => elem.types.includes("administrative_area_level_1"));
            let country = previous.results[0].address_components.find(elem => elem.types.includes("country"));
            let continent = previous.results[0].address_components.find(elem => elem.types.includes("continent"));

            /*
            if (locality && governing) {
                city = locality;
                state = governing;
            } else if (governing && country) {
                city = governing;
                state = country;
            } else if (locality && country) {
                city = locality;
                state = country;
            } else {
                city = country || continent || {};
                state = {};
            }
            */

            city = locality || governing || country || continent || {};
            state = locality && governing ? governing : locality ? country : {};

            let geocode = [previous.results[0].geometry.location.lat, previous.results[0].geometry.location.lng];

            let link = `https://api.forecast.io/forecast/${extra.keychain.darksky}/${geocode.join(",")}?units=si`;

            request(link, (error, response, body) => {
                // Handle Request Errors
                if (error) {
                    return util.error(error, "weather", channel);
                }

                // Parse JSON
                let data = JSON.parse(body);
                let condition = data.currently.summary;
                let icon = data.currently.icon;
                let chanceofrain = Math.round((data.currently.precipProbability * 100) / 5) * 5;
                let temperature = Math.round(data.currently.temperature);
                let feelslike = Math.round(data.currently.apparentTemperature * 10) / 10;
                let humidity = Math.round(data.currently.humidity * 100);

                let generate = () => {
                    let background = input => {
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
                    };

                    Canvas.registerFont(path.join(__dirname, "fonts", "Roboto-Regular.ttf"), { family: "Roboto" });
                    Canvas.registerFont(path.join(__dirname, "fonts", "RobotoCondensed-Regular.ttf"), { family: "Roboto Condensed" });
                    Canvas.registerFont(path.join(__dirname, "fonts", "RobotoMono-Light.ttf"), { family: "Roboto Mono" });

                    let canvas = new Canvas(400, 180);
                    let ctx = canvas.getContext("2d");
                    let Image = Canvas.Image;
                    let base = new Image();
                    let cond = new Image();
                    let humid = new Image();
                    let precip = new Image();
                    let pointer = new Image();

                    let theme = "light";
                    let fontColour = "#FFFFFF";

                    if (background(icon) === "snow") {
                        theme = "dark";
                        fontColour = "#444444";
                    }

                    base.src = path.join(__dirname, "base", `${background(icon)}.png`);
                    cond.src = path.join(__dirname, "icons", theme, `${icon}.png`);
                    humid.src = path.join(__dirname, "icons", theme, "humidity.png");
                    precip.src = path.join(__dirname, "icons", theme, "precip.png");
                    pointer.src = path.join(__dirname, "icons", theme, "pointer.png");

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
                    channel.sendFile(canvas.toBuffer())
                        .then(() => message.delete())
                        .catch(error => util.error(error, "weather", channel));

                    // Debug
                    console.log(chalk.magenta.bold("Location:"), chalk.magenta(location), chalk.magenta(`[${geocode}]`));
                    console.log(chalk.magenta.bold("Base:"), chalk.magenta(base.src));
                    console.log(chalk.magenta.bold("Icon:"), chalk.magenta(icon));
                    console.log(chalk.magenta.bold("Temperature:"), chalk.magenta(`${temperature}°`), chalk.magenta(`(${feelslike}°)`));
                    console.log(chalk.magenta.bold("Rain Chance:"), chalk.magenta(`${chanceofrain}%`));
                    console.log(chalk.magenta.bold("Humidity"), chalk.magenta(`${humidity}%`));
                };

                return generate();
            });
        }

        return null;
    });

    return null;
};

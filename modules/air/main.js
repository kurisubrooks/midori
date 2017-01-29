"use strict";

const path = require("path");
const chalk = require("chalk");
const Canvas = require("canvas");
const request = require("request");

module.exports = (bot, channel, user, args, id, message, extra) => {
    let util = extra.util;

    if (args.length === 0) {
        if (extra.config.aqi.hasOwnProperty(extra.trigger.id)) {
            args = extra.config.aqi[extra.trigger.id];
        } else {
            return channel.sendMessage(`Sorry, you don't have permission to use this command.`);
        }
    }

    // AQI ID
    if (Number(args[0])) {
        request(`https://api.kurisubrooks.com/api/aqi?id=${args[0]}`, (error, response, body) => {
            try {
                body = JSON.parse(body);
            } catch(err) {
                console.error(err);
            }

            if (error) {
                return util.error(error, "aqi", channel);
            } else if (!body.ok) {
                if (body.debug) console.error(body.debug);
                return util.error(body.error, "aqi", channel);
            } else if (response.statusCode !== 200) {
                if (response.statusCode === 504) {
                    util.error("Sorry, the API took too long to respond. Try again?", "aqi", channel);
                } else {
                    util.error(response.statusCode, "aqi", channel);
                }

                return null;
            }

            console.log(chalk.magenta.bold("Location:"), chalk.magenta(body.location.place));
            console.log(chalk.magenta.bold("Quality:"), chalk.magenta(body.aqi.level));
            console.log(chalk.magenta.bold("Index:"), chalk.magenta(body.aqi.index));

            let canvas = new Canvas(400, 100);
            let ctx = canvas.getContext("2d");

            let Image = Canvas.Image;

            let generate = () => {
                Canvas.registerFont(path.join(__dirname, "Roboto.ttf"), { family: "Roboto" });

                let base = new Image();
                base.src = path.join(__dirname, "base.png");

                // Environment Variables
                ctx.drawImage(base, 0, 0);
                ctx.scale(1, 1);
                ctx.patternQuality = "bilinear";
                ctx.filter = "bilinear";
                ctx.antialias = "subpixel";
                ctx.fillStyle = "#000000";

                // Place
                ctx.font = "20px Roboto";
                ctx.fillText(body.location.place, 25, 41);

                // Condition
                ctx.font = "18px Roboto";
                ctx.fillStyle = body.aqi.color;
                ctx.fillText(body.aqi.level, 25, 68);

                // Value
                ctx.font = "60px Roboto";
                ctx.fillStyle = body.aqi.color;
                ctx.textAlign = "right";
                ctx.fillText(body.aqi.value, 370, 67);

                // Send
                channel.sendFile(canvas.toBuffer())
                    .then(() => message.delete())
                    .catch(error => util.error(error, "aqi", channel));
            };

            return generate();
        });
    } else {
        channel.sendMessage(`Sorry, that's not a valid ID.`);
    }

    return null;
};

const path = require("path");
const chalk = require("chalk");
const Canvas = require("canvas");
const request = require("request");

module.exports = (bot, channel, user, args, id, message, extra) => {
    const { util, config, trigger } = extra;

    if (args.length === 0) {
        if (config.aqi.hasOwnProperty(trigger.id)) {
            args = config.aqi[trigger.id];
        } else {
            return channel.sendMessage(`Please provide a place to get the Location ID from`);
        }
    }

    // AQI ID
    if (Number(args[0])) {
        return request(`https://api.kurisubrooks.com/api/aqi?id=${args[0]}`, (error, response, body) => {
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
                    return util.error("Sorry, the API took too long to respond. Try again later.", "aqi", channel);
                } else {
                    return util.error(response.statusCode, "aqi", channel);
                }
            }

            console.log(chalk.magenta.bold("Location:"), chalk.magenta(body.location.place));
            console.log(chalk.magenta.bold("Quality:"), chalk.magenta(body.aqi.level));
            console.log(chalk.magenta.bold("Index:"), chalk.magenta(body.aqi.index));

            Canvas.registerFont(path.join(__dirname, "Roboto.ttf"), { family: "Roboto" });

            const canvas = new Canvas(400, 100);
            const ctx = canvas.getContext("2d");
            const { Image } = Canvas;
            const base = new Image();

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
            return channel.sendFile(canvas.toBuffer())
                .then(() => message.delete())
                .catch(error => util.error(error, "aqi", channel));
        });
    } else {
        return channel.sendMessage(`Sorry, that's not a valid ID.`);
    }
};

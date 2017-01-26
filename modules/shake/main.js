"use strict";

const fs = require("fs");
const qs = require("qs");
const chalk = require("chalk");
const request = require("request");
const Canvas = require("canvas");

let debug_chan;
let kurisu_chan;
let previous_quake = { };
let previous_message;
let disconnected = false;

let getMap = data => {
    let options = qs.stringify({
        zoom: 6,
        size: "386x159",
        format: "png",
        center: `${data.details.geography.lat},${data.details.geography.long}`,
        markers: `${data.details.geography.lat},${data.details.geography.long}`,
        maptype: "roadmap",
        style: "feature:road|color:0xFFFFFF"
    });

    return `https://maps.googleapis.com/maps/api/staticmap?${options}`;
};

let eew = (bot, util, data, dir) => {
    console.log(chalk.magenta.bold("Shake:"), chalk.magenta.bold("Running EEW Parser"));

    request.get({ url: getMap(data), encoding: "binary" }, (error, res, body) => {
        if (error) {
            return util.error(error, "shake");
        } else if (res.statusCode !== 200) {
            return util.error(`Request (map) returned ${res.statusCode}`, "shake");
        }

        let path = `${dir}/modules/shake/`;

        Canvas.registerFont(path.join(path, "fonts", "Roboto.ttf"), { family: "Roboto" });

        let canvas = new Canvas(400, 280);
        let ctx = canvas.getContext("2d");

        let Image = Canvas.Image;
        let map = new Image();
        let base = new Image();
        map.src = new Buffer(body, "binary");
        base.src = fs.readFileSync(path.join(path, "base", "card.png"));

        // Draw Image
        ctx.drawImage(base, 0, 0);
        ctx.drawImage(map, 7, 73);
        ctx.scale(1, 1);
        ctx.patternQuality = "bilinear";
        ctx.filter = "bilinear";
        ctx.antialias = "subpixel";

        // Epicenter
        ctx.font = "17px Roboto";
        ctx.fillStyle = "#FFF";
        ctx.fillText(data.details.epicenter.en, 20, 35);

        // Details
        ctx.font = "15px Roboto";
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fillText(`Magnitude ${data.details.magnitude}, Seismic ${data.details.seismic.en}, Depth ${data.details.geography.depth}km`, 20, 58);

        // Footer
        ctx.font = "15px Roboto";
        ctx.fillStyle = "#000";
        ctx.fillText("Information is preliminary", 56, 257);

        // New Quake
        if (!(data.id in previous_quake)) {
            previous_quake[data.id] = data;

            // kurisu
            kurisu_chan.sendFile(canvas.toBuffer())
                .then(msg => {
                    previous_message = msg;
                    console.log(chalk.magenta.bold("Debug:"), chalk.magenta(`Posted Image to @kurisu#general`));
                })
                .catch(error => util.error(error, "shake"));
        // Last Revision
        } else if (data.situation === 1) {
            previous_quake[data.id] = data;

            previous_message.delete()
                .then(() => {
                    previous_message = "";
                    console.log(chalk.magenta.bold("Debug:"), chalk.magenta(`Deleted Previous Image from @kurisu#general`));
                })
                .catch(error => util.error(error, "shake"));

            // kurisu
            kurisu_chan.sendFile(canvas.toBuffer())
                .then(() => console.log(chalk.magenta.bold("Debug:"), chalk.magenta(`Posted Image to @kurisu#general`)))
                .catch(error => util.error(error, "shake"));
        }

        return null;
    });
};

module.exports = (bot, util, config, keychain, dir) => {
    const socket = require("socket.io-client")(keychain.shake);

    // @kurisu#owlery
    debug_chan = bot.channels.get("212917108445544449");
    // @kurisu#general
    kurisu_chan = bot.channels.get("132368736119291904");

    socket.on("connect", () => socket.emit("auth", { version: 2.1 }));
    socket.on("quake.eew", (data) => eew(bot, util, data, dir));

    socket.on("auth", (data) => {
        if (data.ok) {
            console.log(chalk.green.bold("Shake: Connected"));

            if (disconnected) {
                debug_chan.sendMessage("Reconnected");
                disconnected = false;
            }
        } else {
            console.log(chalk.red.bold("Shake: Auth Failed"));
            util.error(data, "shake");

            disconnected = true;
            throw data.message;
        }
    });

    socket.on("disconnect", () => {
        debug_chan.sendMessage("Disconnected");
        console.log(chalk.red.bold("Shake: Disconnected"));

        disconnected = true;
    });
};

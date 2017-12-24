const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");
const socket = require("socket.io-client");
const request = require("request-promise");
const Subprocess = require("../../core/Subprocess");

let previous_message;
let previous_quake = { };
let disconnected = false;

module.exports = class ShakeProcess extends Subprocess {
    constructor(client) {
        super(client, {
            name: "Shake",
            description: "Earthquake Early Warnings Poster",
            config: "shake",
            disabled: true
        });

        this.postChannel = this.client.channels.get(this.config.channels.post);
        this.debugChannel = this.client.channels.get(this.config.channels.debug);
        this.io = socket(this.config.socket);
    }

    run() {
        this.io.on("connect", () => this.io.emit("auth", { version: 2.1 }));
        this.io.on("quake.eew", data => this.parse(data, false));

        this.io.on("auth", data => {
            if (data.ok) {
                this.log("Connected", "success");

                if (disconnected) {
                    this.error("Reconnected to Socket", this.debugChannel);
                    disconnected = false;
                }
            } else {
                throw this.error("Authentication Failed", this.debugChannel);
            }
        });

        this.io.on("disconnect", () => {
            this.error("Disconnected from Socket", this.debugChannel);
            disconnected = true;
        });
    }

    async parse(data, debug) {
        this.log("Running EEW Parser", "debug");

        const channel = debug ? this.debugChannel : this.postChannel;

        const response = await request({
            headers: { "User-Agent": "Mozilla/5.0" },
            uri: "https://maps.googleapis.com/maps/api/staticmap",
            encoding: "binary",
            qs: {
                zoom: 6,
                size: "386x159",
                format: "png",
                maptype: "roadmap",
                style: "feature:road|color:0xFFFFF",
                center: `${data.details.geography.lat},${data.details.geography.long}`,
                markers: `${data.details.geography.lat},${data.details.geography.long}`
            }
        }).catch(err => {
            this.log(err, "fatal", true);
            return this.error(err, this.debugChannel);
        });

        Canvas.registerFont(path.join(__dirname, "Roboto.ttf"), { family: "Roboto" });

        const canvas = new Canvas(400, 280);
        const ctx = canvas.getContext("2d");

        const { Image } = Canvas;
        const map = new Image();
        const base = new Image();

        map.src = new Buffer(response, "binary");
        base.src = fs.readFileSync(path.join(__dirname, "base.png"));

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
            previous_message = await channel.sendFile(canvas.toBuffer());
            this.log(`Posted Image to #${channel.name}`, "debug");
            return true;
        // Last Revision
        } else if (data.situation === 1) {
            previous_quake[data.id] = data;
            await previous_message.delete().catch(err => err.message);
            this.log(`Deleted Previous Image from #${channel.name}`, "debug");
            previous_message = "";
            await channel.sendFile(canvas.toBuffer());
            this.log(`Posted Image to #${channel.name}`, "debug");
            return true;
        }

        return false;
    }
};

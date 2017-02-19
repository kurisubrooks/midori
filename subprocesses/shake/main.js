import fs from "fs";
import qs from "querystring";
import path from "path";
import Canvas from "canvas";
import socket from "socket.io-client";
import request from "request-promise";
import Subprocess from "../../core/Subprocess";

let previous_message;
let previous_quake = { };
let disconnected = false;

export default class ShakeProcess extends Subprocess {
    constructor(client) {
        super(client, {
            name: "Shake",
            description: "Earthquake Early Warnings Poster"
        });

        // Kurisu#updates
        this.postChannel = this.client.channels.get("276249021579001857");
        // Kurisu#owlery
        this.debugChannel = this.client.channels.get("212917108445544449");
        // Init WebSocket
        this.io = socket(this.keychain.shake);
    }

    run() {
        this.io.on("connect", () => this.io.emit("auth", { version: 2.1 }));
        this.io.on("quake.eew", data => this.parse(data));

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

    async parse(data) {
        this.log("Running EEW Parser", "debug");

        const response = await request({
            uri: this.getMap(data),
            headers: { "User-Agent": "Mozilla/5.0" },
            encoding: "binary",
            json: true
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
            previous_message = await this.postChannel.sendFile(canvas.toBuffer());
            this.log("Posted Image to postChannel", "debug");
            return true;
        // Last Revision
        } else if (data.situation === 1) {
            previous_quake[data.id] = data;
            await previous_message.delete();
            this.log("Deleted Previous Image from PostChannel", "debug");
            previous_message = "";
            await this.postChannel.sendFile(canvas.toBuffer());
            this.log("Posted Image to postChannel", "debug");
            return true;
        }

        return null;
    }

    getMap(data) {
        const options = qs.stringify({
            zoom: 6,
            size: "386x159",
            format: "png",
            center: `${data.details.geography.lat},${data.details.geography.long}`,
            markers: `${data.details.geography.lat},${data.details.geography.long}`,
            maptype: "roadmap",
            style: "feature:road|color:0xFFFFFF"
        });

        return `https://maps.googleapis.com/maps/api/staticmap?${options}`;
    }
}

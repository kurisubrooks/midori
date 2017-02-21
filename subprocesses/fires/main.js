// const request = require("request-promise");
const Subprocess = require("../../core/Subprocess");

module.exports = class FireProcess extends Subprocess {
    constructor(client) {
        super(client, {
            name: "Fires",
            description: "RFS Bushfire Warnings",
            disabled: true
        });
    }

    run() {
        setInterval(this.check, 1 * 60 * 1000);
    }

    check() {
        return true;
    }
};

/*
const request = require("superagent");

const levels = {
    "Not Applicable": { url: "http://i.imgur.com/LzUSutH.png" },
    "Advice": { url: "http://i.imgur.com/0bBmzZk.png" },
    "Watch and Act": { url: "http://i.imgur.com/L37N9sN.png" },
    "Emergency Warning": { url: "http://i.imgur.com/treI1DH.png" }
};

module.exports =  (bot, util, config, keychain, dir) => {
    const channel = bot.channels.get("276249021579001857");
    const run = () => {
        request.get("https://api.kurisubrooks.com/api/fire", (error, res, body) => {
            if (error) {
                return util.error(error, "fires");
            } else if (res.statusCode !== 200) {
                return util.error(`Request returned ${res.statusCode}`, "fires");
            }

            const data = typeof body === "object" ? body : JSON.parse(body);
            const embed = {
                "color": config.colours.error,
                "author": {
                    "name": "Advice",
                    "icon_url": "https://cdn.discordapp.com/attachments/273635911139328001/279818372051369994/unknown.png"
                },
                "fields": [
                    {
                        "name": "Location",
                        "value": "Hickeys Lane, Penrith"
                    },
                    {
                        "name": "Type",
                        "value": "Grass Fire",
                        "inline": 1
                    },
                    {
                        "name": "Status",
                        "value": "Out of control",
                        "inline": 1
                    }
                ],
                "image": { "url": "https://maps.googleapis.com/maps/api/staticmap?center=Hickeys%20Lane%20Penrith&markers=Hickeys%20Lane%20Penrith&size=400x220&zoom=12" }
            };

            return channel.send("", { embed }).catch(error => util.error(error, "fires"));
        });
    };

    setInterval(() => run(), 1 * 60 * 1000);
};
*/

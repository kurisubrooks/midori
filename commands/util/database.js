const request = require("request-promise");
const Command = require("../../core/Command");
const Database = require("../../core/Database");

class DB extends Command {
    constructor(client) {
        super(client, {
            name: "Database",
            description: "Interact with Midori's Database",
            aliases: ["get", "set", "reset"]
        });
    }

    async update(message, user, data) {
        await user.update({ data: JSON.stringify(data) });
        this.log(`Updated User: ${message.author.id}`, "debug");
        this.log(JSON.stringify(data), "debug");
        await message.reply(`Updated Database successfully.`);
        return this.delete(message);
    }

    async run(message, channel, user, args) {
        const command = message.command;
        let pung = false;

        // Check for Pinged user
        for (let index = 0; index < args.length; index++) {
            const userMatched = /<@!?([0-9]+)>/g.exec(args[index]);

            if (userMatched && userMatched.length > 1) {
                user = message.guild.members.get(userMatched[1]);
                args.splice(index, 1);
                pung = true;
            }
        }

        const intention = args[0];
        const query = args.slice(1).join(" ");
        const template = { weather: null };

        if (pung && !this.hasAdmin(message.author)) return message.reply("Insufficient Permissions");
        let data = await Database.Models.Users.findOne({ where: { id: user.id } });

        // Check if User Exists in DB, Create if they don't
        if (!data) {
            await Database.Models.Users.create({ id: user.id, data: JSON.stringify(template) });
            data = await Database.Models.Users.findOne({ where: { id: user.id } });
            this.log(`Added User: ${user.id}`, "debug");
        }

        if (command === "reset") {
            this.log(`${user.username} deleted their db entry`, "debug");
            await data.update(JSON.stringify(template));
            return message.reply("I've reset your database entry.");
        } else if (command === "get") {
            // if (!this.hasAdmin(message.author)) return message.reply("Insufficient Permissions");
            await message.channel.send(`\`\`\`js\n${JSON.stringify(JSON.parse(data.data), null, 4)}\n\`\`\``);
        } else if (command === "set") {
            let manipulate = JSON.parse(data.data);

            if (!query || query === "" || query === " ") return message.reply("Missing 'set' parameter");

            if (intention === "location") {
                const geolocation = await request({
                    headers: { "User-Agent": "Mozilla/5.0" },
                    uri: "https://maps.googleapis.com/maps/api/geocode/json",
                    json: true,
                    qs: {
                        address: encodeURIComponent(query),
                        key: this.keychain.google.geocode
                    }
                }).catch(error => this.error(error.response.body.error, channel));

                if (!geolocation) return false;
                if (geolocation.status !== "OK") return this.handleNotOK(channel, geolocation);
                if (geolocation.results.length > 1) {
                    let places = [];
                    for (const val of geolocation.results) places.push(`\`${val.formatted_address}\``);
                    return message.reply(`Too many results were returned! Here's some of the returned results, please try to narrow it down for me...\n${places.join(", ")}`);
                }

                const locality = geolocation.results[0].address_components.find(elem => elem.types.includes("locality"));
                const governing = geolocation.results[0].address_components.find(elem => elem.types.includes("administrative_area_level_1"));
                const country = geolocation.results[0].address_components.find(elem => elem.types.includes("country"));
                const continent = geolocation.results[0].address_components.find(elem => elem.types.includes("continent"));

                const city = locality || governing || country || continent || {};
                const state = locality && governing ? governing : locality ? country : {};
                const geocode = [geolocation.results[0].geometry.location.lat, geolocation.results[0].geometry.location.lng];

                manipulate.weather = [city, state, geocode];
                return this.update(message, data, manipulate);
            }
        }

        return false;
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
}

module.exports = DB;

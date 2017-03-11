const request = require("request-promise");
const Command = require("../../core/Command");
const Database = require("../../core/Database");

module.exports = class DatabaseCommand extends Command {
    constructor(client) {
        super(client, {
            name: "database",
            description: "Interact with Midori's Database",
            aliases: ["db", "get", "set", "reset"]
        });
    }

    async update(message, user, data) {
        await user.update({ data: JSON.stringify(data) });
        this.log(`Updated User: ${message.author.id}`, "debug");
        this.log(JSON.stringify(data), "debug");
        await message.reply(`Updated Database successfully.`);
        return message.delete().catch(err => err.message);
    }

    async run(message, channel, _user, args) {
        const command = message.command;
        const mentioned = message.mentions.users;
        const user = mentioned.size > 0 ? mentioned.first() : message.author;

        const intention = args[0];
        const query = args.slice(1).join(" ");
        const template = { weather: null, balance: null };

        if (mentioned.size > 0 && !this.hasAdmin(message.author)) return message.reply("Insufficient Permissions");
        let data = await Database.Models.Users.findOne({ where: { id: user.id } });

        // Check if User Exists in DB, Create if they don't
        if (!data) {
            await Database.Models.Users.create({ id: user.id, data: JSON.stringify(template) });
            data = await Database.Models.Users.findOne({ where: { id: user.id } });
            this.log(`Added User: ${user.id}`, "debug");
        }

        if (command === "reset") {
            await data.update(JSON.stringify(template));
            return message.reply(`Reset ${user.username} successfully.`);
        } else if (command === "get") {
            // if (!this.hasAdmin(message.author)) return message.reply("Insufficient Permissions");
            await message.channel.send(`\`\`\`js\n${JSON.stringify(JSON.parse(data.data), null, 4)}\n\`\`\``);
        } else if (command === "set") {
            let manipulate = JSON.parse(data.data);

            if (intention === "location") {
                const geolocation = await request({
                    headers: { "User-Agent": "Mozilla/5.0" },
                    uri: "https://maps.googleapis.com/maps/api/geocode/json",
                    json: true,
                    qs: {
                        address: encodeURIComponent(query),
                        key: this.keychain.google.geocode
                    }
                }).catch(err => {
                    this.log(err, "fatal", true);
                    return this.error(err, channel);
                });

                if (geolocation.status !== "OK") return this.handleNotOK(channel, geolocation);
                if (geolocation.results.length > 1) {
                    let places = [];
                    for (const val of geolocation.results) places.push(`\`${val.formatted_address}\``);
                    return message.reply(`Too many results, please refine your search:\n${places.join(", ")}`);
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

        // Remove or Delete a value from the DB
        /* if (command === "remove" || command === "delete") {
            return this;
        } */

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
};

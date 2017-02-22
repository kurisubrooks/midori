const request = require("superagent");
const Command = require("../../core/Command");
const { Users } = require("../../core/Models");

module.exports = class DatabaseCommand extends Command {
    constructor(client) {
        super(client, {
            name: "database",
            description: "Interact with Midori's Database",
            aliases: ["db", "set"]
        });
    }

    async run(message, channel, user, args) {
        const command = message.command;
        const intention = args[0];
        const query = args.slice(1).join(" ");

        let dbUser = await Users.findOne({ where: { id: user.id } });

        let template = {
            weather: null,
            balance: null
        };

        // Check if User Exists in DB, Create if they don't
        if (!dbUser) {
            dbUser = await Users.create({
                id: user.id,
                data: JSON.stringify(template)
            });

            this.log(`Added User: ${user.id}`, "debug");
        }

        let data = await Users.findOne({ where: { id: user.id } });

        // Add or Set a value in the DB
        if (command === "add" || command === "set") {
            let manipulate = JSON.parse(data.data);
            let update = false;

            if (intention === "weather" || intention === "location") {
                let geolocation;
                try {
                    geolocation = await request
                        .get(`https://maps.googleapis.com/maps/api/geocode/json`)
                        .query(`address=${encodeURIComponent(query)}`)
                        .query(`key=${this.keychain.google.geocode}`);
                } catch(err) {
                    this.log(err, "fatal", true);
                    return this.error(err, channel);
                }

                if (geolocation.body.status !== "OK") return this.handleNotOK(channel, geolocation.body);
                if (geolocation.body.results.length > 1) {
                    let places = [];
                    for (const val of geolocation.body.results) places.push(`\`${val.formatted_address}\``);
                    return message.reply(`Too many results, please refine your search:\n${places.join(", ")}`);
                }

                const locality = geolocation.body.results[0].address_components.find(elem => elem.types.includes("locality"));
                const governing = geolocation.body.results[0].address_components.find(elem => elem.types.includes("administrative_area_level_1"));
                const country = geolocation.body.results[0].address_components.find(elem => elem.types.includes("country"));
                const continent = geolocation.body.results[0].address_components.find(elem => elem.types.includes("continent"));

                const city = locality || governing || country || continent || {};
                const state = locality && governing ? governing : locality ? country : {};
                const geocode = [geolocation.body.results[0].geometry.location.lat, geolocation.body.results[0].geometry.location.lng];

                manipulate.weather = [city, state, geocode];
                update = true;
            }

            if (update) {
                await data.update({ data: JSON.stringify(manipulate) });
                this.log(`Updated User: ${user.id}`, "debug");
                this.log(JSON.stringify(manipulate), "debug");
                await message.reply(`Updated Database successfully.`);
                return message.delete().catch();
            }

            return false;
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

const Command = require("../../core/Command");
const Database = require("../../core/Database");

class Set extends Command {
    constructor(client) {
        super(client, {
            name: "Set",
            description: "Provide Data to the Database",
            aliases: []
        });
    }

    // Database User Object Template
    static getTemplate() {
        return {
            location: null,
            timezone: null
        };
    }

    static async getUser(user) {
        let db = await Database.Models.Users.findOne({ where: { id: user.id } });

        // Ensure User Object is always up to date with the latest template
        if (db) {
            const data = JSON.parse(db.data);
            let update = null;

            for (const key in Set.getTemplate()) {
                if (!(key in data)) {
                    update = data;
                    data[key] = Set.getTemplate()[key];
                }
            }

            if (update) {
                await db.update({ data: JSON.stringify(update) });
            }

            db = await Database.Models.Users.findOne({ where: { id: user.id } });
        }

        // Create User if not exists
        if (!db) {
            await Database.Models.Users.create({ id: user.id, data: JSON.stringify(Set.getTemplate()) });
            db = await Database.Models.Users.findOne({ where: { id: user.id } });
            // Set.log(`Created User: ${user.id}`, "debug");
        }

        return db;
    }

    async update(model, data) {
        await model.update({ data: JSON.stringify(data) });
        this.log(JSON.stringify(data), "debug");
        return true;
    }

    async run(message, channel, user, args) {
        const fields = ["location"];
        let field, data, db;

        if (message.pung.length > 0) {
            if (!this.hasAdmin(message.author)) {
                return message.reply("Insufficient Permissions");
            }

            return message.reply("unable to modify other users, feature unimplemented.");
        }

        // No Command Supplied
        if (args.length === 0) {
            await message.reply(`what field would you like to update? Available fields:\`${fields.join(", ")}\`. Expires in 30s.`);
            const filter = msg => msg.author.id === user.id;
            const res = await channel.awaitMessages(filter, { max: 1, time: 30 * 1000 });
            const text = res.first().content;

            if (text.split(" ").length > 1) {
                return message.reply("only expected 1 argument. Cancelling...");
            }

            field = text.split(" ")[0];

            if (fields.indexOf(field) === -1) {
                return message.reply(`${field} is not a valid field!`);
            }

            if (field) {
                await message.reply(`what value would you like to set \`${field}\` to? Expires in 30s.`);
                const filter = msg => msg.author.id === user.id;
                const res = await channel.awaitMessages(filter, { max: 1, time: 30 * 1000 });
                data = res.first().content;
            }
        }

        if (!field && args.length >= 1) field = args[0];
        if (!data && args.length >= 2) data = args.slice(1);

        if (!field || !data) {
            return message.reply("required fields are missing! Try running this command without any arguments for a walkthrough.");
        }

        db = await Set.getUser(user);
        const userdata = JSON.parse(db.data);

        if (field === "location") {
            const { geolocation } = require("../weather/conditions");
            const parsed = await geolocation(data);

            if (typeof parsed === "string") {
                return this.error(parsed, channel);
            }

            userdata[field] = parsed;
            this.update(db, userdata);
            this.log(`Updated Entry for ${user.id}`, "debug");
            return message.reply(`successfully set your location to ${parsed.line1}, ${parsed.line2}.`);
        }

        if (field === "timezone") {
            return message.reply("you can't change this field at present.");
        }

        return message.reply("sorry, that's not a valid field.");
    }
}

module.exports = Set;

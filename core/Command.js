const config = require("../config");
const keychain = require("../keychain.json");
const Logger = require("./Util/Logger");
const { error, toUpper } = require("./Util/Util");

module.exports = class Command {
    constructor(client, data = {}) {
        if (typeof data !== "object") throw new TypeError("Client data parameter must be an object");

        this.client = client;
        this.config = config;
        this.keychain = keychain;

        this.name = data.name;
        this.description = data.description;
        this.aliases = data.aliases || [];
        this.process = data.process || false;
        this.usage = data.usage || "";
        this.guild = data.guild || false;
        this.admin = data.admin || false;
        this.disabled = data.disabled || false;

        if (!this.name) throw new Error("Command Name is required");
        if (!this.description) throw new Error("Command Description is required");
        if (typeof this.name !== "string") throw new TypeError("Command name must be a string");
        if (typeof this.description !== "string") throw new TypeError("Command description must be a string");
        if (!(this.aliases instanceof Array)) throw new TypeError("Command aliases must be an array of strings");
        if (this.aliases.some(alias => typeof alias !== "string")) throw new TypeError("Command aliases must be an array of strings");
        if (typeof this.guild !== "boolean") throw new TypeError("Command guildOnly property must be a boolean");
        if (typeof this.admin !== "boolean") throw new TypeError("Command adminOnly property must be a boolean");
        if (typeof this.disabled !== "boolean") throw new TypeError("Command disabled property must be a boolean");
    }

    run() {
        throw new Error("Missing Run Method");
    }

    log(message, style = "success", stacktrace) {
        return Logger[style](toUpper(this.name), message, stacktrace);
    }

    error(message, channel) {
        return error(this.name, message, channel);
    }

    delete(message) {
        return true;
        // return message.delete().catch(err => err.message);
    }

    hasAdmin(user) {
        return config.admin.includes(user.id);
    }
};

import config from "../config";
import keychain from "../keychain.json";
import { error, log, toUpper } from "./Util";
import { Client } from "discord.js";

export default class Command {
    constructor(client, data = {}) {
        this.client = client;
        this.config = config;
        this.keychain = keychain;

        this.name = data.name;
        this.description = data.description;
        this.aliases = data.aliases || [];
        this.usage = data.usage || "";
        this.guildOnly = data.guildOnly || false;
        this.adminOnly = data.adminOnly || false;
        this.disabled = data.disabled || false;
        
        if (!this.client || !(this.client instanceof Client)) throw new Error("Discord Client is required");
        if (!this.name) throw new Error("Command Name is required");
        if (!this.description) throw new Error("Command Description is required");
    }

    run() {
        throw new Error("Missing Run Method");
    }

    log(message, style) {
        return log(toUpper(this.name), message, style);
    }

    error(message, channel) {
        return error(this.name, message, channel);
    }

    hasAdmin(user) {
        return config.admin.includes(user.id);
    }
}

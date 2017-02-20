import config from "../config";
import keychain from "../keychain.json";
import { error, log, toUpper } from "./Util";
import { Client } from "discord.js";

export default class Subprocess {
    constructor(client, data = {}) {
        if (typeof data !== "object") throw new Error("Subprocess data parameter must be an object");
        if (!client || !(client instanceof Client)) throw new Error("Discord Client is required for Subprocess");

        this.client = client;
        this.keychain = keychain;

        this.name = data.name;
        this.description = data.description;
        this.disabled = data.disabled || false;
        this.config = data.config || null;

        if (!this.name) throw new Error("Subprocess Name is required");
        if (!this.description) throw new Error("Subprocess Description is required");
        if (typeof this.disabled !== "boolean") throw new TypeError("Subprocess disabled property must be a boolean");
        if (typeof this.name !== "string") throw new TypeError("Subprocess name must be a string");
        if (typeof this.description !== "string") throw new TypeError("Subprocess description must be a string");
        if (this.config && !config.hasOwnProperty(this.config)) throw new Error("Subprocess Config Object was not found in Config File");

        this.config = config[this.config];
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
}

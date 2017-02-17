import config from "../config";
import keychain from "../keychain.json";
import { error, log, toUpper } from "./Util";

export default class Subprocess {
    constructor(client, data) {
        this.client = client;
        this.config = config;
        this.keychain = keychain;

        this.name = data.name;
        this.description = data.description;

        if (!this.name) throw new Error("Subprocess Name is required");
        if (!this.description) throw new Error("Subprocess Description is required");
    }

    run() {
        throw new Error("Missing Run Method");
    }

    log(message, style) {
        return log(toUpper(this.name), message, style);
    }

    error(message, channel) {
        return error(toUpper(this.name), message, channel);
    }
}

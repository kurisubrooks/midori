import fs from "fs";
import path from "path";
import { error, log, toUpper } from "./Util";
import { Collection, Client } from "discord.js";

export default class SubprocessManager {
    constructor(client) {
        if (!client || !(client instanceof Client)) throw new Error("Discord Client is required for Subprocess Manager");
        
        this.client = client;
        this.processes = new Collection();
    }

    loadModules(dir) {
        const subprocesses = fs.readdirSync(path.join(__dirname, "../", dir));

        for (const item of subprocesses) {
            const location = path.join(__dirname, "../", dir, item, "main.js");

            // Location doesn't exist, skip loop
            if (!fs.existsSync(location)) continue;

            // Add Subprocess to Processes Collection
            const Process = require(location).default;
            const instance = new Process(this.client);

            if (instance.disabled) continue;
            log("Loaded Process", toUpper(instance.name), "info");

            if (this.processes.has(instance.name) {
                throw new Error("Subprocesses cannot have the same name");
            } else {
                this.processes.set(instance.name, instance);
            }
        }

        for (const subprocess of this.processes.values()) {
            this.startModule(subprocess);
        }
    }

    startModule(subprocess) {
        try {
            log("Spawning Process", `${subprocess.name}`, "info");
            return subprocess.run();
        } catch(err) {
            return error("Subprocess", err);
        }
    }
}

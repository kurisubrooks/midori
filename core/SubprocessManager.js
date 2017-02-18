import fs from "fs";
import path from "path";
import { error, log, toUpper } from "./Util";
import { Collection } from "discord.js";

export default class SubprocessManager {
    constructor(client) {
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

            this.processes.set(item, instance);
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

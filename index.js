// Nano Core v5
// by @kurisubrooks

// Core
import { Client } from "discord.js";
import { log, error, handleJoin } from "./core/Util";
import keychain from "./keychain.json";
import CommandManager from "./core/CommandManager";
import SubprocessManager from "./core/SubprocessManager";

// Initialise
const client = new Client();

const Subprocesses = new SubprocessManager(client);
Subprocesses.loadModules("./subprocesses/");

const Manager = new CommandManager(client);
Manager.loadCommands("./commands/");

// Handle Discord
client.login(keychain.discord);
client.once("ready", () => log("Discord", "Ready", "success"));
client.on("warn", warning => error("Core", warning));
client.on("error", error => error("Core", error));
client.on("guildMemberAdd", member => handleJoin(member));
client.on("message", message => Manager.handleMessage(message));

export default client;

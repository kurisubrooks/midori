// Nano Core v5
// by @kurisubrooks

// Core
import { Client } from "discord.js";
import { error, handleReady, handleJoin } from "./core/Util";
import keychain from "./keychain.json";
import CommandManager from "./core/CommandManager";

// Initialise
const client = new Client();
const Manager = new CommandManager(client);
Manager.loadCommands("./commands/");

// Handle Discord
client.login(keychain.discord);
client.once("ready", () => handleReady(client));
client.on("warn", warning => error(warning, null, "Core"));
client.on("error", error => error(error, null, "Core"));
client.on("guildMemberAdd", member => handleJoin(member));
client.on("message", message => Manager.handleMessage(message));

export default client;

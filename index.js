// Nano Core v5
// by @kurisubrooks

// Core
import { Client } from "discord.js";
import util from "./util";
import keychain from "./keychain.json";
import CommandManager from "./core/CommandManager";

// Initialise
const client = new Client();
const Manager = new CommandManager(client);
Manager.loadCommands("./commands/");

// Handle Discord
client.login(keychain.discord);
client.once("ready", () => util.handleReady(client, util));
client.on("warn", warning => util.error(warning, "core"));
client.on("error", error => util.error(error, "core"));
client.on("guildMemberAdd", member => util.handleJoin(member));
client.on("message", message => Manager.handleMessage(message));

exports.bot = client;

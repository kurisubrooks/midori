// Nano Core v5
// by @kurisubrooks

// Core
import { Client, GatewayIntentBits } from 'discord.js';
import { error } from './core/Util/Util';
import keys from './keychain.json';
import config from './config.js';
import Logger from './core/Util/Logger';
import CommandManager from './core/CommandManager';
// const SubprocessManager = require("./core/SubprocessManager");

// Initialise
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildInvites] });
const Manager = new CommandManager(client);
// const Subprocesses = new SubprocessManager(client);

const onReady = () => {
  Manager.loadCommands(config.directory);
  Logger.success('Discord', `Ready, Logged in as ${client.user.username}`);
  // Subprocesses.loadModules("./subprocesses/");
};

// Handle Discord
client.login(keys.discord);
client.once('ready', onReady);
client.on('warn', warn => error('Core', warn));
client.on('error', err => error('Core', err));
// client.on('interactionCreate', interaction => Manager.handleInteraction(interaction));
client.on('messageCreate', message => Manager.handleMessage(message));
client.on('messageUpdate', (old, _new) => {
  if (old.content !== _new.content) Manager.handleMessage(_new);
});

export default client;

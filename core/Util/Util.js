import { MessageEmbed } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from '../../config';
import Logger from './Logger';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const toUpper = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const error = (name, message, channel) => {
  const embed = new MessageEmbed()
    .setColor(config.colours.error)
    .addField('Module', name, true)
    .addField('Time', Logger.time(), true)
    .addField('Message', message);

  channel = channel || null;
  Logger.error(name, message);

  if (channel) channel.send({ embeds: [embed] });
  return false;
};

// Unhandled Promise Rejections
process.on('unhandledRejection', reason =>
  Logger.error('Unhandled Rejection', reason, true));

// Unhandled Errors
process.on('uncaughtException', error =>
  Logger.error('Uncaught Exception', error, true));

// Log Start
Logger.info('Process', 'Started');

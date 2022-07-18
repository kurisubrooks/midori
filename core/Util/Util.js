import { EmbedBuilder } from 'discord.js';
import config from '../../config';
import Logger from './Logger';

export const toUpper = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const error = (name, message, channel) => {
  const embed = new EmbedBuilder()
    .setColor(config.colours.error)
    .addFields([
      { name: 'Module', value: name, inline: true },
      { name: 'Time', value: Logger.time(), inline: true },
      { name: 'Message', value: message.toString() }
    ]);

  channel = channel || null;
  Logger.error(name, message);
  console.trace(message);

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

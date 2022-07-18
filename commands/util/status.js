import { EmbedBuilder } from 'discord.js';
import moment from 'moment';
import 'moment-duration-format';
import worker from 'core-worker';
import os from 'os';

import Command from '../../core/Command';

export default class Status extends Command {
  constructor(client) {
    super(client, {
      name: 'Status',
      description: 'Midori Status',
      aliases: ['stats', 'uptime']
    });
  }

  async run(message, channel) {
    const npmv = await worker.process('npm -v').death();
    const etho = os.networkInterfaces().eth0;
    const embeds = [];

    if (!etho || !etho[0] || etho[0].mac !== this.config.server) {
      const embed = new EmbedBuilder()
        .setColor(this.config.colours.warn)
        .setTitle('Warning')
        .setDescription(`${this.client.user.username} doesn't seem to be running from it's usual server, this usually means it's running in Development Mode, which may add extra latency to command response time.`);

      embeds.push(embed);
    }

    const embed = new EmbedBuilder()
      .setColor(this.config.colours.default)
      .setTitle(`${this.client.user.username} Status`)
      .setThumbnail(this.client.user.avatarURL())
      .addFields([
        { name: 'Uptime', value: moment.duration(this.client.uptime).format('d[d] h[h] m[m] s[s]'), inline: true },
        { name: 'Memory Usage', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, inline: true },
        { name: 'Node Version', value: process.version.replace('v', ''), inline: true },
        { name: 'NPM Version', value: npmv.data.replace('\n', ''), inline: true }
      ]);

    embeds.push(embed);
    return channel.send({ embeds: embeds });
  }
}

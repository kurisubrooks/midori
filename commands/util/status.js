
import { MessageEmbed } from 'discord.js';
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

    if (!etho || !etho[0] || etho[0].mac !== this.config.server) {
      const embed = new MessageEmbed()
        .setColor(this.config.colours.warn)
        .setTitle('Warning')
        .setDescription("Midori doesn't seem to be running from it's usual server, this usually means it's running in Development Mode, which may add extra latency to command response time.");

      channel.send({ embeds: [embed] });
    }

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setTitle('Midori Status')
      .setThumbnail(this.client.user.avatarURL())
      .addField('Uptime', moment.duration(this.client.uptime).format('d[d] h[h] m[m] s[s]'), true)
      .addField('Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, true)
      .addField('Node Version', process.version.replace('v', ''), true)
      .addField('NPM Version', npmv.data.replace('\n', ''), true);

    return channel.send({ embeds: [embed] });
  }
}

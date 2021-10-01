const Command = require('../../core/Command');
const request = require('request-promise');
const { MessageEmbed } = require('discord.js');

class Nom extends Command {
  constructor(client) {
    super(client, {
      name: 'Nom',
      description: 'Nom!',
      aliases: ['food']
    });
  }

  async run(message, channel, user) {
    const response = await request({
      headers: { 'User-Agent': 'Mozilla/5.0' },
      uri: 'https://rra.ram.moe/i/r',
      qs: { type: 'nom', nsfw: false },
      json: true
    }).catch(error => this.error(error.response.body.error, channel));

    if (!response) return false;

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setDescription(`**${user.tag}** nommed`)
      .setImage(`https://cdn.ram.moe${response.path.replace('i/', '')}`);

    await channel.send({ embeds: [embed] });
    return this.delete(message);
  }
}

module.exports = Nom;

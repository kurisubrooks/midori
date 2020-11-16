const request = require('request-promise');
const { MessageEmbed } = require('discord.js');
const Command = require('../../core/Command');

class Cat extends Command {
  constructor(client) {
    super(client, {
      name: 'Cats',
      description: 'Post a randomly selected image of a cat',
      aliases: ['cat', 'cats', 'kat', 'kitty', 'kitteh', 'neko', 'meow']
    });
  }

  async run(message, channel, user) {
    const response = await request({
      headers: { 'User-Agent': 'Mozilla/5.0' },
      uri: 'http://shibe.online/api/cats',
      json: true,
      qs: {
        count: 1
        // httpsurls: true
      }
    }).catch(error => this.error(error.response.body.error, channel));

    if (!response) return false;

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setAuthor(user.nickname, user.avatarURL())
      .setImage(response[0]);

    await channel.send({ embed });
    return this.delete(message);
  }
}

module.exports = Cat;

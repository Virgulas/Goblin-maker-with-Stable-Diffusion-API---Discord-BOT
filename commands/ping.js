const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const phraseSend = async action => {
    action.channel.send({
        embeds: [new EmbedBuilder().setTitle("macaco").setImage("https://ichef.bbci.co.uk/news/640/amz/worldservice/live/assets/images/2015/09/26/150926165742__85730600_monkey2.jpg")]
    })
    action.reply({
      ephemeral: true,
      content: 'sucesso'
    });
}

module.exports = {
    data: new SlashCommandBuilder()
      .setName("macaco")
      .setDescription("macaco."),
    async execute(interaction) {
      const action = await interaction;
      try {
        phraseSend(action);
      } catch (error) {
        console.log(error)
      }
    },
  };
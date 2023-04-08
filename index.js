const fs = require("node:fs");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, 
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers
] });
const config = require('./config.json');

 
client.commands = new Collection();


const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));


for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
  }

client.on("ready", async () => {
    console.log("on");
  });
  
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    
    if (!command) return;
  
    try {
      await command.execute(interaction); 
    } catch (error) {
      console.error(error);
      await interaction.reply({
      content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
});

client.login(config.token);
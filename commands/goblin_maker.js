const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const goblin_features = require("../goblin_maker_logistic.json");
const Goblin = require("../classes/goblin");
const nomes = require("../names.json");
const artMaker = require("../stableDiffusion");
let log = "";
let stableDiffusionData = {features: [], items: []};

const basic_feature = (option) => {
    const options = Object.keys(goblin_features[option]);
    const size = options.length
    const index = Math.floor(Math.random() * size);
    log += `Você rodou ${index + 1} para ${option}.\n`;
    stableDiffusionData[option] = options[index];
    return goblin_features[option][options[index]]
}

const goblinNameGenerator = () => {
    let nomeGerado = "";
    
    for (let i = 0; i < 3; i++) {
      const nomeAleatorio = nomes[Math.floor(Math.random() * nomes.length)];
      const silabas = nomeAleatorio.match(/[bcdfghjklmnpqrstvwxyz]*[aeiouáéíóú]/gi);
      const silabaAleatoria = silabas[Math.floor(Math.random() * silabas.length)];
      nomeGerado += silabaAleatoria;
    }

    let firstLetter = nomeGerado[0];
    let name = nomeGerado.slice(1, nomeGerado.length);
    return firstLetter.toUpperCase() + name.toLowerCase();
}

const anomaly = () => {
    const options = Object.keys(goblin_features["anomalies"]);
    const size = options.length;
    let count = 1, extra_eyes = 2, features = [];

    for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * (size + 1));
        const feature = options[index];
        if (index > size - 1) {
            count += 2;
            log += `Você rodou ${index + 1} e ganhou uma anomalia extra.\n`;
            continue;
        }
        if (features.some(f => goblin_features.anomalies[feature] == f)) {
            i--;
        }
        else if (feature == "extra_eyes") {
            extra_eyes += Math.floor(Math.random() * 6) + 1;
            log += `Você rodou ${index + 1} e teve olhos extras adicionados.\n`;
        }
        else {
            features.push(goblin_features.anomalies[feature]);
            stableDiffusionData.features.push(feature);
            log += `Você rodou ${index + 1} e uma anomalia foi adicionada.\n`;
        }
    }
    console.log(features);
    console.log(stableDiffusionData.features);
    if (extra_eyes != 2) {
        features.push(extra_eyes + " olhos");
        stableDiffusionData.features.push(extra_eyes + "_eyes");
    }
    
    if (features.length > 1) {
        return " com " + [...features].slice(0, features.length - 1).join(", ") + " e " + features[features.length - 1];
    }
    else {
        return " com " + features[0];
    }
}

const setEquips = (type) => {
    const equips = goblin_features["equip_" + type];
    const size = equips.length;
    const index = Math.floor(Math.random() * size);
    log += `Você rodou ${index + 1} em armas do tipo ${type}.\n`;

    Object.keys(equips[index]).forEach(eqp => {
        if (eqp != "name") {
            stableDiffusionData.items.push(equips[index][eqp]["qty"] + "_" + eqp);
        }
    });

    return equips[index];
}

const getStatus = (color, occupation) => {
    let status = {...goblin_features.base_status[color]};   

    switch (occupation) {
        case "Mercenário":
          status["combate"]++;
          status["habilidade"]++;
          break;
        case "Caçador":
          status["combate"]++;
          status["sorte"]++;
          break;
        case "Ladrão":
          status["habilidade"]++;
          status["conhecimento"]++;
          break;
        case "Líder":
          status["combate"]++;
          status["conhecimento"]++;
          break;
        case "Piromaníaco":
          status["habilidade"]++;
          status["sorte"]++;
          break;
        case "Xamã":
          status["sorte"]++;
          status["conhecimento"]++;
          break;
        default:
          console.log("ocupação não reconhecida");
      }
      return status;
}

const makeGoblin = async action => {
    const name = goblinNameGenerator(),
    color = basic_feature("colors"),
    characteristic = basic_feature("characteristics"),
    occupation = basic_feature("occupations"),
    anomalies = anomaly(),
    equips = setEquips(goblin_features.equip_type[occupation]),
    status = getStatus(color, occupation);

    await action.deferReply();

    const id = await artMaker(stableDiffusionData, name)

    const file = new AttachmentBuilder(`./goblin_images/${name}${id}.jpg`);
    file.setName(`${name}${id}.jpg`);
    

    const goblin = new Goblin(name, color, characteristic, occupation, anomalies, equips, status);

    const colors = {
        ["verde claro"]: 0xb6ff8c,
        ["verde"]: 0x4ac900,
        ["verde escuro"]: 0x0b4200,
        ["amarelo"]: 0xffdd00,
        ["vermelho"]: 0xff0000,
        ["azul"]: 0x0099FF
    }
    
    const goblinEmbed = new EmbedBuilder()
	.setColor(colors[goblin.color])
	.setTitle(goblin.name)
	.setDescription('Um goblin '+ goblin.characteristic + goblin.anomaly)
	.setThumbnail(`attachment://${name}${id}.jpg`)
	.addFields(
        { name: 'Ocupação', value: goblin.occupation},
        { name: 'Cor', value: goblin.color},
        { name: 'Equipamento', value: goblin.equipment_name},
        { name: 'Status:', value: '\u200B' },
        { name: 'Nível', value: goblin.level + "" },
        { name: 'Vida', value: "♥".repeat(goblin.life) },
		{ name: 'Proteção', value: goblin.protection + '', inline: true },
		{ name: 'Dano', value: goblin.damage[0] ? goblin.damage.join(" | ") : 0 + '', inline: true },
        { name: '\u200B', value: '\u200B' },
		{ name: 'Dano em área', value: goblin.area_damage[0] ? goblin.area_damage.join(" | ") : 0 + '', inline: true },
        { name: 'Mágica', value: goblin.magic + "", inline: true },
        { name: '\u200B', value: '\u200B' },
		{ name: 'Combate', value: goblin.attributes["combate"] + '' , inline: true },
		{ name: 'Habilidade', value: goblin.attributes["habilidade"] + '', inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: 'Conhecimento', value: goblin.attributes["conhecimento"] + '', inline: true },
        { name: 'Sorte', value: goblin.attributes["sorte"] + '', inline: true }	
	)
    .setImage(`attachment://${name}${id}.jpg`); 
    
    
    action.editReply({
        content: log,
        embeds: [goblinEmbed],
        files: [file]
    });
} 

module.exports = {
    data: new SlashCommandBuilder()
      .setName("goblin_maker")
      .setDescription("gere um Goblin automaticamente"),
    async execute(interaction) {
      const action = await interaction;
      try {
        await makeGoblin(action);
        log = "";
        stableDiffusionData = {features: [], items: []};
      } catch (error) {
        console.log(error)
      }
    },
  };
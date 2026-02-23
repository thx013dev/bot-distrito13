const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  PermissionsBitField
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.TOKEN;
const CANAL_REGISTROS = process.env.CANAL;
const CARGO_RECRUTA = process.env.RECRUTA;
const CARGO_MEMBRO = process.env.MEMBRO;
const CARGO_LIDER = process.env.LIDER;
const CANAL_LOG = process.env.LOG;

client.once("ready", () => {
  console.log(`🔥 Distrito13 dominante online como ${client.user.tag}`);
});

/* ================= PAINEL ================= */

client.on(Events.MessageCreate, async message => {
  if (message.content === "!painel") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return;

    const botao = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("registro_d13")
        .setLabel("🔥 Registrar na Distrito13")
        .setStyle(ButtonStyle.Danger)
    );

    await message.channel.send({
      content: "🔥 **RECRUTAMENTO OFICIAL DISTRITO13**\nClique abaixo para iniciar seu registro.",
      components: [botao]
    });
  }
});

/* ================= INTERAÇÕES ================= */

client.on(Events.InteractionCreate, async interaction => {

  /* ===== INICIAR REGISTRO ===== */

  if (interaction.isButton() && interaction.customId === "registro_d13") {

    const modal = new ModalBuilder()
      .setCustomId("form_d13")
      .setTitle("Registro Oficial Distrito13");

    const nome = new TextInputBuilder()
      .setCustomId("nome")
      .setLabel("Nome RP")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const id = new TextInputBuilder()
      .setCustomId("id")
      .setLabel("ID no servidor")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const experiencia = new TextInputBuilder()
      .setCustomId("exp")
      .setLabel("Experiência em facção")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nome),
      new ActionRowBuilder().addComponents(id),
      new ActionRowBuilder().addComponents(experiencia)
    );

    return interaction.showModal(modal);
  }

  /* ===== ENVIO DO FORMULÁRIO ===== */

  if (interaction.isModalSubmit() && interaction.customId === "form_d13") {

    const nome = interaction.fields.getTextInputValue("nome");
    const id = interaction.fields.getTextInputValue("id");
    const exp = interaction.fields.getTextInputValue("exp");

    const canal = await client.channels.fetch(CANAL_REGISTROS);

    const botoes = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`aprovar_${interaction.user.id}_${nome}_${id}`)
        .setLabel("✅ Aprovar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`recusar_${interaction.user.id}`)
        .setLabel("❌ Recusar")
        .setStyle(ButtonStyle.Danger)
    );

    await canal.send({
      content: `📋 **NOVO REGISTRO D13**

👤 ${interaction.user}
📝 Nome RP: ${nome}
🆔 ID: ${id}
📚 Experiência:
${exp || "Não informado"}`,
      components: [botoes]
    });

    return interaction.reply({ content: "📨 Registro enviado para liderança.", ephemeral: true });
  }

  /* ===== APROVAR ===== */

  if (interaction.isButton() && interaction.customId.startsWith("aprovar_")) {

    if (!interaction.member.roles.cache.has(CARGO_LIDER))
      return interaction.reply({ content: "❌ Apenas liderança pode aprovar.", ephemeral: true });

    const dados = interaction.customId.split("_");
    const userId = dados[1];
    const nome = dados[2];
    const id = dados[3];

    const membro = await interaction.guild.members.fetch(userId);

    await membro.roles.add(CARGO_RECRUTA);
    await membro.setNickname(`[D13] ${nome} | ${id}`);

    await interaction.update({ content: "✅ Aprovado com sucesso.", components: [] });

    const log = await client.channels.fetch(CANAL_LOG);
    log.send(`✅ ${membro.user.tag} foi aprovado na Distrito13.`);
  }

  /* ===== RECUSAR ===== */

  if (interaction.isButton() && interaction.customId.startsWith("recusar_")) {

    if (!interaction.member.roles.cache.has(CARGO_LIDER))
      return interaction.reply({ content: "❌ Apenas liderança pode recusar.", ephemeral: true });

    await interaction.update({ content: "❌ Registro recusado.", components: [] });
  }
});

/* ================= ANTI CRASH ================= */

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

client.login(TOKEN);

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

const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`🔥 Distrito13 Bot online como ${client.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
  if (message.content === '!painel') {

    const botao = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('registro_d13')
          .setLabel('🔥 Fazer Registro Distrito13')
          .setStyle(ButtonStyle.Danger)
      );

    await message.channel.send({
      content: `🔥 **RECRUTAMENTO DISTRITO13**
Clique abaixo para iniciar seu registro.`,
      components: [botao]
    });
  }
});

client.on(Events.InteractionCreate, async interaction => {

  if (interaction.isButton()) {

    if (interaction.customId === 'registro_d13') {

      const modal = new ModalBuilder()
        .setCustomId('form_d13')
        .setTitle('Registro Distrito13');

      const nome = new TextInputBuilder()
        .setCustomId('nome')
        .setLabel('Nome RP')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const id = new TextInputBuilder()
        .setCustomId('id')
        .setLabel('ID no servidor')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const idade = new TextInputBuilder()
        .setCustomId('idade')
        .setLabel('Idade')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nome),
        new ActionRowBuilder().addComponents(id),
        new ActionRowBuilder().addComponents(idade)
      );

      await interaction.showModal(modal);
    }

    if (interaction.customId.startsWith('aprovar_')) {

      if (!interaction.member.roles.cache.has(config.cargoStaff)) {
        return interaction.reply({ content: '❌ Você não tem permissão.', ephemeral: true });
      }

      const userId = interaction.customId.split('_')[1];
      const membro = await interaction.guild.members.fetch(userId);

      await membro.roles.add(config.cargoRecruta);
      await membro.setNickname(`[D13] Aprovado`);

      await interaction.update({
        content: '✅ Registro aprovado!',
        components: []
      });

      await membro.send('🔥 Você agora faz parte da Distrito13. Seja bem-vindo.');

    }

    if (interaction.customId.startsWith('recusar_')) {

      if (!interaction.member.roles.cache.has(config.cargoStaff)) {
        return interaction.reply({ content: '❌ Você não tem permissão.', ephemeral: true });
      }

      await interaction.update({
        content: '❌ Registro recusado.',
        components: []
      });
    }
  }

  if (interaction.isModalSubmit()) {

    if (interaction.customId === 'form_d13') {

      const nome = interaction.fields.getTextInputValue('nome');
      const id = interaction.fields.getTextInputValue('id');
      const idade = interaction.fields.getTextInputValue('idade');

      const canal = await client.channels.fetch(config.canalRegistros);

      const botoes = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`aprovar_${interaction.user.id}`)
            .setLabel('✅ Aprovar')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`recusar_${interaction.user.id}`)
            .setLabel('❌ Recusar')
            .setStyle(ButtonStyle.Danger)
        );

      await canal.send({
        content:
`📋 **Novo Registro D13**

👤 Usuário: ${interaction.user}
📝 Nome RP: ${nome}
🆔 ID: ${id}
🎂 Idade: ${idade}`,
        components: [botoes]
      });

      await interaction.reply({
        content: '📨 Registro enviado para análise da liderança.',
        ephemeral: true
      });
    }
  }
});

client.login(config.token);

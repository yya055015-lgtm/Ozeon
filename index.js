require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const command = new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Envia uma embed com um botão')
    .addStringOption(option =>
        option.setName('embed')
            .setDescription('Texto que aparecerá na embed')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('nome')
            .setDescription('Nome que aparecerá no botão')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('link')
            .setDescription('Link que o botão abrirá')
            .setRequired(true)
    );

async function registrarComando() {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('Registrando /embed no servidor...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: [command.toJSON()] }
        );

        console.log('✅ /embed registrado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao registrar /embed:');
        console.error(error);
    }
}

client.once('ready', async () => {
    console.log(`🤖 Bot online como ${client.user.tag}`);
    await registrarComando();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'embed') return;

    const texto = interaction.options.getString('embed');
    const nome = interaction.options.getString('nome');
    const link = interaction.options.getString('link');

    try {
        const url = new URL(link);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
        return interaction.reply({
            content: '❌ Coloque um link válido começando com http:// ou https://',
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder().setDescription(texto);

    const button = new ButtonBuilder()
        .setLabel(nome)
        .setURL(link)
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
        embeds: [embed],
        components: [row]
    });
});

client.login(process.env.TOKEN);

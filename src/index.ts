import { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes, Snowflake } from 'discord.js';
import { config } from 'dotenv';

config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Helper function to check if user is bot owner
const isOwner = (userId: Snowflake): boolean => {
    return userId === process.env.OWNER_ID;
};

// Commands array
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Says hello!')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Your name')
                .setRequired(false)
        ),

    // Owner-only commands
    new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Shuts down the bot (Owner only)'),

    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shows bot status (Owner only)'),
];

// Register slash commands
async function deployCommands() {
    try {
        console.log('Started refreshing application (/) commands.');

        const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            { body: commands.map(command => command.toJSON()) },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

// Bot ready event
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    await deployCommands();
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;

    // Public commands
    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    }

    else if (commandName === 'hello') {
        const name = interaction.options.getString('name') ?? 'World';
        await interaction.reply(`Hello, ${name}!`);
    }

    // Owner-only commands
    else if (commandName === 'shutdown') {
        if (!isOwner(user.id)) {
            await interaction.reply({ content: '❌ Only the bot owner can use this command!', ephemeral: true });
            return;
        }

        await interaction.reply('👋 Shutting down...');
        setTimeout(() => {
            console.log('Bot shutting down by owner command');
            process.exit(0);
        }, 1000);
    }

    else if (commandName === 'status') {
        if (!isOwner(user.id)) {
            await interaction.reply({ content: '❌ Only the bot owner can use this command!', ephemeral: true });
            return;
        }

        const uptime = Math.floor(process.uptime());
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;

        await interaction.reply({
            content: `📊 **Bot Status**\n` +
                `🕐 Uptime: ${hours}h ${minutes}m ${seconds}s\n` +
                `📡 Ping: ${client.ws.ping}ms\n` +
                `🏠 Servers: ${client.guilds.cache.size}\n` +
                `👥 Users: ${client.users.cache.size}`,
            ephemeral: true
        });
    }
});

// Handle regular messages (optional)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        await message.reply('Pong!');
    }
});

// Login
client.login(process.env.DISCORD_TOKEN);
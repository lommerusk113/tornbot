import { Client, GatewayIntentBits, Events, REST, Routes } from 'discord.js';
import { ENV } from './config/environment';
import { commands } from './commands';
import { handleSlashCommand } from './handlers/commandHandler';
import { handleMessage } from './handlers/messageHandler';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Register slash commands
async function deployCommands() {
    try {
        console.log('Started refreshing application (/) commands.');

        const rest = new REST().setToken(ENV.DISCORD_TOKEN);

        await rest.put(
            Routes.applicationCommands(ENV.CLIENT_ID),
            { body: commands.map(command => command.data.toJSON()) },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
}

// Bot ready event
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    await deployCommands();
});

// Handle interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        await handleSlashCommand(interaction);
    }
});

// Handle messages
client.on(Events.MessageCreate, handleMessage);

// Login
client.login(ENV.DISCORD_TOKEN);
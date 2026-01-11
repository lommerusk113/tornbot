import { Client, GatewayIntentBits, Events, REST, Routes, TextChannel } from 'discord.js';
import { ENV } from './config/environment';
import { commands } from './commands';
import { handleSlashCommand } from './handlers/commandHandler';
import { handleMessage } from './handlers/messageHandler';
import { Database } from "./repository/supabase";
import { ChaseService } from "./services/ChaseService";
import { WarMember } from "./types";
import { AlertService } from "./services/AlertService";
import { TerritoryWarService } from './services/TerritoryWarService';

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

    setInterval(async () => {
        await AlertService.checkAndSendAlerts(client);
    }, 5 * 60 * 1000)

    await TerritoryWarService.start(client);


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
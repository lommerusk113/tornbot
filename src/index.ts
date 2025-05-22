import { Client, GatewayIntentBits, Events, REST, Routes } from 'discord.js';
import { ENV } from './config/environment';
import { commands } from './commands';
import { handleSlashCommand } from './handlers/commandHandler';
import { handleMessage } from './handlers/messageHandler';
import {Database} from "./repository/supabase";
import { ChaseService } from "./services/ChaseService";
import {Activity} from "./types";

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

    const data: Activity[] | undefined = await Database.getData()

    if (data) {
        const allies = ChaseService.getAllies(data)
        const enemies = ChaseService.getEnemies(data)
        const dangers = ChaseService.getConflicts(allies, enemies)

        const message = dangers.flatMap(x => {
            return x.threatenedAllies.map(y => {
                return `${y.id} is getting chased by ${x.enemy.id}`
            })
        })

    }

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
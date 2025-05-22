import {Client, GatewayIntentBits, Events, REST, Routes, TextChannel} from 'discord.js';
import { ENV } from './config/environment';
import { commands } from './commands';
import { handleSlashCommand } from './handlers/commandHandler';
import { handleMessage } from './handlers/messageHandler';
import {Database} from "./repository/supabase";
import { ChaseService } from "./services/ChaseService";
import {WarMember} from "./types";

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

    const data: WarMember[] | undefined = await Database.getData()

    if (data) {
        const allies = ChaseService.getAllies(data)
        const enemies = ChaseService.getEnemies(data)
        const dangers = ChaseService.getConflicts(allies, enemies)

        const messages = dangers.flatMap(x => {
            return x.threatenedAllies.map(y => {
                return `<@${y.discord_id}> is getting chased by ${x.enemy.member_name}`
            })
        })

        if (messages.length > 0) {
            const channel = await client.channels.fetch(ENV.ALERT_CHANNEL_ID) as TextChannel
            await channel.send(messages[0])
        }

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
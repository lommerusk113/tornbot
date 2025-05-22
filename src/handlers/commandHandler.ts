import { ChatInputCommandInteraction } from 'discord.js';
import { commands } from '../commands';
import { isOwner } from '../utils/permissions';

export async function handleSlashCommand(interaction: ChatInputCommandInteraction) {
    const command = commands.find(cmd => cmd.data.name === interaction.commandName);

    if (!command) {
        console.warn(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    // Check owner-only commands
    if (command.ownerOnly && !isOwner(interaction.user.id)) {
        await interaction.reply({
            content: '❌ Only the bot owner can use this command!',
            ephemeral: true
        });
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);

        const errorMessage = 'There was an error while executing this command!';

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
}
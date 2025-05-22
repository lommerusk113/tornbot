import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types';

export const shutdown: Command = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Shuts down the bot (Owner only)'),

    ownerOnly: true,

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('👋 Shutting down...');
        setTimeout(() => {
            console.log('Bot shutting down by owner command');
            process.exit(0);
        }, 1000);
    }
};
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types';

export const hello: Command = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Says hello!')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Your name')
                .setRequired(false)
        ) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {
        const name = interaction.options.getString('name') ?? 'World';
        await interaction.reply(`Hello, ${name}!`);
    }
};
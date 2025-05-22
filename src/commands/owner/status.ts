import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types';

export const status: Command = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shows bot status (Owner only)'),

    ownerOnly: true,

    async execute(interaction: ChatInputCommandInteraction) {
        const uptime = Math.floor(process.uptime());
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;

        await interaction.reply({
            content: `📊 **Bot Status**\n` +
                `🕐 Uptime: ${hours}h ${minutes}m ${seconds}s\n` +
                `📡 Ping: ${interaction.client.ws.ping}ms\n` +
                `🏠 Servers: ${interaction.client.guilds.cache.size}\n` +
                `👥 Users: ${interaction.client.users.cache.size}`,
            ephemeral: true
        });
    }
};
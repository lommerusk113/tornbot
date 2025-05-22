import { Message } from 'discord.js';

export async function handleMessage(message: Message) {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        await message.reply('Pong!');
    }

    // Add more message-based commands here
}
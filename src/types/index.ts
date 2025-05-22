import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    ownerOnly?: boolean;
}

type Location = {
    current: string,
    destination: string
}

export type Activity = {
    location: Location
    alerted: boolean
    id: number,
    member_id: number,
    faction_id: number
}

export type Chased = {
    enemy: Activity
    threatenedAllies: Activity[]
}
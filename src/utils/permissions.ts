import { Snowflake } from 'discord.js';
import { ENV } from '../config/environment';

export const isOwner = (userId: Snowflake): boolean => {
    return userId === ENV.OWNER_ID;
};
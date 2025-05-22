import { config } from 'dotenv';

config();

export const ENV = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN!,
    CLIENT_ID: process.env.CLIENT_ID!,
    OWNER_ID: process.env.OWNER_ID!,
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
} as const;

// Validate required environment variables
const requiredEnvVars = [
    'DISCORD_TOKEN',
    'CLIENT_ID',
    'OWNER_ID',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
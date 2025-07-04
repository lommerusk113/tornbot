import { Client, TextChannel } from 'discord.js';
import { ENV } from '../config/environment';
import { Database } from '../repository/supabase';
import { ChaseService } from './ChaseService';
import { WarMember } from '../types';

export class AlertService {

    static async checkAndSendAlerts(client: Client): Promise<void> {
        try {
            const data: WarMember[] | undefined = await Database.getData();

            if (!data) {
                console.log('No data received from database');
                return;
            }

            const allies = ChaseService.getAllies(data);
            const enemies = ChaseService.getEnemies(data);
            const dangers = ChaseService.getConflicts(allies, enemies);

            if (dangers.length === 0) {
                console.log('No dangers detected');
                return;
            }

            const messages = this.formatAlertMessages(dangers);
            await this.sendAlerts(client, messages);
            await this.markMembersAsAlerted(dangers);

        } catch (error) {
            console.error('Error in checkAndSendAlerts:', error);
        }
    }

    private static formatAlertMessages(dangers: ReturnType<typeof ChaseService.getConflicts>): string[] {
        return dangers.flatMap(danger => {
            return danger.threatenedAllies.map(ally => {
                const initiatedTimestamp = Math.floor(new Date(danger.enemy.location.initiated!).getTime() / 1000);
                return `<@${ally.discord_id}> is getting chased by [${danger.enemy.member_name}](https://www.torn.com/profiles.php?XID=${danger.enemy.member_id}), initiated at: <t:${initiatedTimestamp}:T>`;
            });
        });
    }

    private static async sendAlerts(client: Client, messages: string[]): Promise<void> {
        if (messages.length === 0) return;

        try {
            const channel = await client.channels.fetch(ENV.ALERT_CHANNEL_ID) as TextChannel;

            if (!channel) {
                console.error('Alert channel not found');
                return;
            }

            for (const message of messages) {
                await channel.send(message);
            }

            console.log(`Sent ${messages.length} alert message(s)`);
        } catch (error) {
            console.error('Error sending alerts:', error);
        }
    }

    private static async markMembersAsAlerted(dangers: ReturnType<typeof ChaseService.getConflicts>): Promise<void> {
        try {
            const updatePromises = dangers.flatMap(danger =>
                danger.threatenedAllies.map(member =>
                    Database.insertData(member.id)
                )
            );

            await Promise.all(updatePromises);
            console.log('Marked members as alerted in database');
        } catch (error) {
            console.error('Error marking members as alerted:', error);
        }
    }
}
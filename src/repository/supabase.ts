import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/environment';
import {WarMember} from "../types";

export const supabase = createClient(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_ANON_KEY
);

export class Database {

    static async getData() {
        const { data, error } = await supabase
            .from('war_tracker')
            .select('*')

        if (error) throw error;
        return data as WarMember[];
    }

    static async insertData(id?: number) {
        await supabase
            .from('war_tracker')
            .update({ alerted: true })
            .eq('id', id);

    }

}
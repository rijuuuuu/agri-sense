import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
let supabaseInstance = null;
export function getSupabaseClient() {
    if (supabaseInstance)
        return supabaseInstance;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key && url.trim().length > 0 && key.trim().length > 0) {
        try {
            supabaseInstance = createClient(url, key, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            });
            console.log('✅ [Supabase] Connected to remote Supabase instance:', url);
        }
        catch (err) {
            console.warn('⚠️ [Supabase] Failed to initialize Supabase client:', err);
        }
    }
    return supabaseInstance;
}
export function isSupabaseConfigured() {
    return getSupabaseClient() !== null;
}

import { createClient } from '@supabase/supabase-js';
import { getEnv } from '@/lib/env';
const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = getEnv();
if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
    throw new Error(`Supabase client initialization failed: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.\n` +
        `VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}\n` +
        `VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}`);
}
const supabaseClient = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
    // db: { schema: 'public' }, // default is public, so this can be omitted or set to public
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});
export const supabase = supabaseClient;

import { createClient } from '@supabase/supabase-js';
import { getEnv } from '@/lib/env';

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = getEnv();

const supabaseClient = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
  // db: { schema: 'public' }, // default is public, so this can be omitted or set to public
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const supabase = supabaseClient;

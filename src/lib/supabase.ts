import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente para uso en el cliente (con anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para uso en el servidor (con service role key - bypasses RLS)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

export const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'nuvly';

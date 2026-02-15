import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required but not defined`);
  }
  return value;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = getEnv('SUPABASE_URL');
    const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('✅ Supabase (service role) client initialized');
  }

  return supabaseInstance;
}

export function getSupabaseUrl(): string {
  return getEnv('SUPABASE_URL');
}

/**
 * Verifica conexão com o Supabase (backend).
 * Usa query neutra que não depende de tabela específica.
 */
export async function verifySupabaseConnection(): Promise<boolean> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('ℹ️  Supabase connected but tables not yet created (will auto-migrate)');
        return true;
      }
      console.error('❌ Supabase connection error:', error.message, error.code);
      return false;
    }

    console.log('✅ Supabase connection verified, users table accessible');
    return true;
  } catch (error) {
    console.error('❌ Failed to verify Supabase connection:', error);
    return false;
  }
}

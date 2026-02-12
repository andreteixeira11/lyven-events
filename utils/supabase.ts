import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fmjgrewkknqvxqwkouqj.supabase.co";
const supabasePublishableKey = "sb_publishable_L9xKLOGb5LAUvd9pvwHwdQ_8j8oARg1";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

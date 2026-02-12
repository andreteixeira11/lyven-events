import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fmjgrewkknqvxqwkouqj.supabase.co";
const supabasePublishableKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamdyZXdra25xdnhxd2tvdXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzgwMzAsImV4cCI6MjA4NTYxNDAzMH0.SMk5Y3IS_gwyOgBM-Ti1IPwrKiFndcvB4Y1ZgWgSI8A";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL or Anon Key not configured. Some features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export const getSupabaseClient = () => supabase;

export async function signUpWithEmail(email: string, password: string, metadata?: { name?: string }) {
  console.log('📧 Signing up with email:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    console.error('❌ Sign up error:', error.message);
    throw error;
  }

  console.log('✅ Sign up successful:', data.user?.id);
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  console.log('🔐 Signing in with email:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Sign in error:', error.message);
    throw error;
  }

  console.log('✅ Sign in successful:', data.user?.id);
  return data;
}

export async function signOut() {
  console.log('🚪 Signing out...');
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('❌ Sign out error:', error.message);
    throw error;
  }

  console.log('✅ Sign out successful');
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('❌ Get user error:', error.message);
    return null;
  }
  
  return user;
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Get session error:', error.message);
    return null;
  }
  
  return session;
}

export async function resetPassword(email: string) {
  console.log('🔑 Sending password reset email to:', email);
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.error('❌ Reset password error:', error.message);
    throw error;
  }

  console.log('✅ Password reset email sent');
  return data;
}

export async function updatePassword(newPassword: string) {
  console.log('🔒 Updating password...');
  
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('❌ Update password error:', error.message);
    throw error;
  }

  console.log('✅ Password updated successfully');
  return data;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

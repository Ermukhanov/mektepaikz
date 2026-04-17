import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user;
}

export async function getCurrentUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }

  return data;
}

export async function getSchool(schoolId: string) {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single();

  if (error) {
    console.error('Failed to fetch school:', error);
    return null;
  }

  return data;
}

export async function signUpWithSchoolId(email: string, password: string, schoolId: string) {
  // First, verify school exists
  const school = await getSchool(schoolId);
  if (!school) {
    throw new Error('School not found');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        schoolId,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

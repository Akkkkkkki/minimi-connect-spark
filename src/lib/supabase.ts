
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';

// Initialize the Supabase client
const supabaseUrl = "https://uiswjpjgxsrnfxerzbrw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpc3dqcGpneHNybmZ4ZXJ6YnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NTczNzIsImV4cCI6MjA2MDEzMzM3Mn0.UKVXz2DgQhj2GqeTIIu1WJcDREbL2i6wtQoPJWJA5Y8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast.error(error.message);
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    toast.error(err.message || 'An error occurred during sign in');
    return { user: null, session: null, error: err };
  }
};

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userData: { name: string; gender: string; birth_month: string; birth_year: string }
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          gender: userData.gender,
          birth_month: userData.birth_month,
          birth_year: userData.birth_year,
        }
      }
    });

    if (error) {
      toast.error(error.message);
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    toast.error(err.message || 'An error occurred during sign up');
    return { user: null, session: null, error: err };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return { error };
    }
    return { error: null };
  } catch (err: any) {
    toast.error(err.message || 'An error occurred during sign out');
    return { error: err };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return { user: null, error };
    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
};

export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return { session: null, error };
    return { session: data.session, error: null };
  } catch (err) {
    return { session: null, error: err };
  }
};

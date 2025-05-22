// Canonical Supabase client import. Do not import from anywhere else.
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import type { Database } from '@/integrations/supabase/types';

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
  userData: { first_name: string; last_name: string; gender: string; birth_month: string; birth_year: string }
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('Auth sign up error:', error);
      toast.error(error.message);
      return { user: null, session: null, error };
    }
    
    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    console.error('Signup error:', err);
    toast.error(err.message || 'An error occurred during sign up');
    return { user: null, session: null, error: err };
  }
};

// Separate function to create profile after successful signup
export const createUserProfile = async (
  userId: string,
  profileData: { 
    first_name: string; 
    last_name: string; 
    gender: string; 
    birth_month: string | number | null; 
    birth_year: string | number | null 
  }
) => {
  try {
    // Use the generated type for profile insert
    const insertPayload: Database['public']['Tables']['profile']['Insert'] = {
      id: userId,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      gender: profileData.gender,
      birth_month: profileData.birth_month !== null ? Number(profileData.birth_month) : null,
      birth_year: profileData.birth_year !== null ? Number(profileData.birth_year) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted: false,
    };
    const { error } = await supabase
      .from('profile')
      .insert([insertPayload]);
      
    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Profile creation error:', err);
    return { success: false, error: err };
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

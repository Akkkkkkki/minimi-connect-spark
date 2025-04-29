import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/sonner';
import { getEnv } from './env';

// Initialize the Supabase client
const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = getEnv();

export const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
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
  userData: { first_name: string; last_name: string; gender: string; birth_month: string; birth_year: string }
) => {
  console.log('Starting signup process with email:', email);
  
  try {
    // We can't check if the email exists with the anon key, so we'll just attempt the signup
    console.log('Calling Supabase auth.signUp...');
    // Basic signup without any metadata to avoid potential issues
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('Auth sign up error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // If we get the specific database error, give a more helpful message
      if (error.message === 'Database error updating user') {
        toast.error('There was a problem creating your account. Please try using a different email address.');
      } else {
        toast.error(error.message);
      }
      
      return { user: null, session: null, error };
    }
    
    console.log('Auth sign up successful, user:', data.user?.id);
    
    // Return the user data even without adding profile - we can handle that on the client side
    return { 
      user: data.user, 
      session: data.session, 
      error: null 
    };
  } catch (err: any) {
    console.error('Signup error:', err);
    console.error('Error details:', err.stack || JSON.stringify(err, null, 2));
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
    // Convert string values to proper types if they're not already
    const birthMonth = typeof profileData.birth_month === 'string' 
      ? parseInt(profileData.birth_month) 
      : profileData.birth_month;
      
    const birthYear = typeof profileData.birth_year === 'string' 
      ? parseInt(profileData.birth_year) 
      : profileData.birth_year;
      
    const profile = {
      id: userId,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      gender: profileData.gender.toLowerCase(),
      birth_month: birthMonth,
      birth_year: birthYear,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted: false
    };
    
    const { error } = await supabase
      .from('profile')
      .insert([profile]);
      
    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
    
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

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
  userData: { first_name: string; last_name: string; gender: string; birth_month: string; birth_year: string }
) => {
  console.log('Starting signup process with email:', email);
  console.log('User data after client-side conversion:', JSON.stringify(userData, null, 2));
  
  try {
    // First, perform sign up with Supabase Auth
    console.log('Calling Supabase auth.signUp with formatted data...');
    
    // Convert string values to proper types
    const birthMonth = userData.birth_month ? parseInt(userData.birth_month) : null;
    const birthYear = userData.birth_year ? parseInt(userData.birth_year) : null;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          gender: userData.gender,
          // Store as numbers in metadata, not strings
          birth_month: birthMonth,
          birth_year: birthYear,
        }
      }
    });

    if (error) {
      console.error('Auth sign up error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error(error.message);
      return { user: null, session: null, error };
    }
    
    console.log('Auth sign up successful, user:', data.user?.id);
    
    // If we have a user, create their profile immediately to ensure it exists
    if (data.user) {
      try {
        // Check if a profile already exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profile')
          .select('id')
          .eq('id', data.user.id)
          .single();
          
        if (checkError && checkError.code === 'PGRST116') {
          // Profile does not exist, create it
          console.log('Creating profile for new user:', data.user.id);
          
          const profileData = {
            id: data.user.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            gender: userData.gender.toLowerCase(),
            birth_month: birthMonth,
            birth_year: birthYear,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted: false
          };
          
          const { error: insertError } = await supabase
            .from('profile')
            .insert([profileData]);
            
          if (insertError) {
            // Log the error but continue - don't fail the signup
            console.error('Error creating profile:', insertError);
            console.error('Error details:', JSON.stringify(insertError, null, 2));
          } else {
            console.log('Profile created successfully');
          }
        } else if (!checkError) {
          console.log('Profile already exists for user');
        } else {
          console.error('Error checking for existing profile:', checkError);
        }
      } catch (profileErr: any) {
        // Log the profile creation error but don't fail the signup process
        console.error('Profile creation error:', profileErr);
        console.error('Error details:', profileErr.stack || JSON.stringify(profileErr, null, 2));
      }
    }
    
    // Return successful auth result regardless of profile creation status
    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    console.error('Signup error:', err);
    console.error('Error details:', err.stack || JSON.stringify(err, null, 2));
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

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
    // Ensure birth_month and birth_year are properly formatted
    const birthMonth = userData.birth_month ? parseInt(userData.birth_month) : null;
    const birthYear = userData.birth_year ? parseInt(userData.birth_year) : null;
    
    // First, perform sign up with Supabase Auth
    console.log('Calling Supabase auth.signUp with formatted data...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          gender: userData.gender,
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
    
    // Successfully signed up, now let's ensure the profile is properly updated
    if (data.user) {
      try {
        // Add a small delay to ensure the trigger has time to create the profile
        console.log('Waiting for profile creation by trigger...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if profile already exists
        console.log('Checking if profile exists...');
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profile')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error('Error checking profile:', profileCheckError);
        } else {
          console.log('Profile check result:', existingProfile ? 'Found' : 'Not found');
        }
        
        // Only proceed with update if profile exists
        if (existingProfile) {
          console.log('Attempting to update profile...');
          const profileData = {
            id: data.user.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            gender: userData.gender,
            birth_month: birthMonth,
            birth_year: birthYear,
            updated_at: new Date().toISOString()
          };
          console.log('Profile data to insert:', JSON.stringify(profileData, null, 2));
          
          const { error: profileError } = await supabase
            .from('profile')
            .upsert(profileData, { 
              onConflict: 'id', 
              ignoreDuplicates: false
            });
            
          if (profileError) {
            console.error('Error updating profile:', profileError);
            console.error('Error details:', JSON.stringify(profileError, null, 2));
            toast.error(`Profile update error: ${profileError.message}`);
          } else {
            console.log('Profile update successful');
          }
        } else {
          console.error('Profile not found after signup, trigger may have failed');
          
          // Instead of just showing an error, try to create the profile
          console.log('Attempting to create missing profile...');
          const { error: createError } = await supabase
            .from('profile')
            .insert({
              id: data.user.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              gender: userData.gender,
              birth_month: birthMonth,
              birth_year: birthYear,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (createError) {
            console.error('Error creating profile:', createError);
            toast.error(`Profile creation error: ${createError.message}`);
          } else {
            console.log('Profile manually created successfully');
          }
        }
      } catch (profileErr: any) {
        console.error('Unexpected profile update error:', profileErr);
        console.error('Error details:', profileErr.stack || JSON.stringify(profileErr, null, 2));
        toast.error(`Profile error: ${profileErr.message || 'Unknown error'}`);
      }
    }

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

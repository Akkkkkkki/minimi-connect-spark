// Import the Supabase client from the integrations directory
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { getEnv } from './env';
// Initialize the Supabase client
const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = getEnv();
// Auth helper functions
export const signInWithEmail = async (email, password) => {
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
    }
    catch (err) {
        toast.error(err.message || 'An error occurred during sign in');
        return { user: null, session: null, error: err };
    }
};
export const signUpWithEmail = async (email, password, userData) => {
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
    }
    catch (err) {
        console.error('Signup error:', err);
        toast.error(err.message || 'An error occurred during sign up');
        return { user: null, session: null, error: err };
    }
};
// Separate function to create profile after successful signup
export const createUserProfile = async (userId, profileData) => {
    try {
        const { error } = await supabase
            .from('profile')
            .insert([{
                id: userId,
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                gender: profileData.gender,
                birth_month: profileData.birth_month,
                birth_year: profileData.birth_year,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }]);
        if (error)
            throw error;
        return { success: true, error: null };
    }
    catch (err) {
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
    }
    catch (err) {
        toast.error(err.message || 'An error occurred during sign out');
        return { error: err };
    }
};
export const getCurrentUser = async () => {
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error)
            return { user: null, error };
        return { user: data.user, error: null };
    }
    catch (err) {
        return { user: null, error: err };
    }
};
export const getCurrentSession = async () => {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error)
            return { session: null, error };
        return { session: data.session, error: null };
    }
    catch (err) {
        return { session: null, error: err };
    }
};

import { supabase } from "@/integrations/supabase/client";

export const testDirectSignup = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return {
      success: true,
      data,
      error: null
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error
    };
  }
}; 
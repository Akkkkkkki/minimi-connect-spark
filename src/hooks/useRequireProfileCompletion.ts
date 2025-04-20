
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Helper: Returns true if profile is complete (main fields are present)
function isProfileComplete(profile: any) {
  return (
    profile &&
    !!profile.first_name &&
    !!profile.last_name &&
    !!profile.birth_month &&
    !!profile.birth_year &&
    !!profile.city &&
    !!profile.country
  );
}

// Hook to block access and redirect to onboarding if profile not complete
export function useRequireProfileCompletion() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user || isLoading) return;
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!data || !isProfileComplete(data)) {
        navigate("/onboarding");
      }
      setProfileChecked(true);
    };
    check();
  }, [user, isLoading, navigate]);

  return { profileChecked };
}

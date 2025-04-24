
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

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
      // If auth is still loading, wait
      if (isLoading) return;
      
      // If user is not logged in, we don't need to check profile
      // Mark as checked and let auth redirects handle this case
      if (!user) {
        setProfileChecked(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profile")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking profile:", error);
          setProfileChecked(true); // Continue anyway to avoid being stuck
          return;
        }

        if (!data || !isProfileComplete(data)) {
          navigate("/onboarding");
        }
        
        setProfileChecked(true);
      } catch (err) {
        console.error("Unexpected error while checking profile:", err);
        setProfileChecked(true); // Continue anyway to avoid being stuck
      }
    };

    check();
  }, [user, isLoading, navigate]);

  return { profileChecked };
}

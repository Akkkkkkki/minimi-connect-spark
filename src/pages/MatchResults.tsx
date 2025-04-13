
import PageLayout from "@/components/layout/PageLayout";
import MatchList from "@/components/matches/MatchList";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const MatchResults = () => {
  const navigate = useNavigate();
  // In a real implementation, this would come from Supabase auth
  const isAuthenticated = false;

  useEffect(() => {
    // Temporary redirect until authentication is set up
    if (!isAuthenticated) {
      toast.error("Please sign in to view your matches", {
        description: "You'll be redirected to the login page"
      });
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [isAuthenticated, navigate]);

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Your Matches</h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Here are your current matches. Remember to provide feedback to help us improve your future connections.
        </p>
        
        <MatchList />
      </div>
    </PageLayout>
  );
};

export default MatchResults;

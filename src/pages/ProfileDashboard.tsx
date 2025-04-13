
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileInfo from "@/components/profile/ProfileInfo";
import MatchHistory from "@/components/profile/MatchHistory";
import JoinedActivities from "@/components/profile/JoinedActivities";
import { useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

const ProfileDashboard = () => {
  const navigate = useNavigate();
  // In a real implementation, this would come from Supabase auth
  const isAuthenticated = false;

  useEffect(() => {
    // Temporary redirect until authentication is set up
    if (!isAuthenticated) {
      toast.error("Please sign in to view your profile", {
        description: "You'll be redirected to the login page"
      });
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [isAuthenticated, navigate]);

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Profile Dashboard</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="matches">Match History</TabsTrigger>
            <TabsTrigger value="activities">My Activities</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-6">
            <ProfileInfo />
          </TabsContent>
          <TabsContent value="matches" className="mt-6">
            <MatchHistory />
          </TabsContent>
          <TabsContent value="activities" className="mt-6">
            <JoinedActivities />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ProfileDashboard;

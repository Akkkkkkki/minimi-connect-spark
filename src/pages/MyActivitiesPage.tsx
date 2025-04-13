
import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JoinedActivities from "@/components/profile/JoinedActivities";
import { useAuth } from "@/context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import ActivityDetails from "../components/activities/ActivityDetails";
import MatchesList from "../components/match/ConnectionsList";
import { toast } from "@/components/ui/sonner";

const MyActivitiesPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const { activityId } = useParams();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("You must be logged in to access this page", {
        description: "You'll be redirected to the login page",
      });
      setTimeout(() => navigate("/login"), 1500);
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // If there's an activityId in the URL params, use it
  useEffect(() => {
    if (activityId) {
      setSelectedActivityId(activityId);
    }
  }, [activityId]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Loading...</h1>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">My Activities</h1>
        
        {selectedActivityId ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2">
              <TabsTrigger value="details">Activity Details</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <ActivityDetails activityId={selectedActivityId} />
            </TabsContent>
            <TabsContent value="matches" className="mt-6">
              <MatchesList activityId={selectedActivityId} />
            </TabsContent>
          </Tabs>
        ) : (
          <JoinedActivities onSelectActivity={setSelectedActivityId} />
        )}
      </div>
    </PageLayout>
  );
};

export default MyActivitiesPage;

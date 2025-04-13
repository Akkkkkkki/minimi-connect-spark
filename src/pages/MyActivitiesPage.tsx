import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JoinedActivities from "@/components/profile/JoinedActivities";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "react-router-dom";
import ActivityDetails from "../components/activities/ActivityDetails";
import ConnectionsList from "../components/match/ConnectionsList";

const MyActivitiesPage = () => {
  const { isAuthenticated } = useAuth();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const { activityId } = useParams();
  
  // If there's an activityId in the URL params, use it
  useState(() => {
    if (activityId) {
      setSelectedActivityId(activityId);
    }
  });

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">My Activities</h1>
        
        {selectedActivityId ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2">
              <TabsTrigger value="details">Activity Details</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <ActivityDetails activityId={selectedActivityId} />
            </TabsContent>
            <TabsContent value="connections" className="mt-6">
              <ConnectionsList activityId={selectedActivityId} />
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
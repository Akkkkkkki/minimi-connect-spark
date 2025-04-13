
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActivityList from "@/components/activity-management/ActivityList";
import ParticipantList from "@/components/activity-management/ParticipantList";
import MatchRounds from "@/components/activity-management/MatchRounds";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const ActivityManagement = () => {
  const navigate = useNavigate();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  // In a real implementation, this would come from Supabase auth
  const isAuthenticated = false;

  // For demo purposes, we'll simulate a user not being authenticated
  if (!isAuthenticated) {
    toast.error("Please sign in to manage activities", {
      description: "You'll be redirected to the login page"
    });
    setTimeout(() => navigate("/login"), 2000);
  }

  const handleCreateActivity = () => {
    // This would navigate to the activity creation form
    navigate("/create-activity");
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Activity Management</h1>
          <Button onClick={handleCreateActivity} className="w-full md:w-auto">
            <Plus size={16} className="mr-2" />
            Create Activity
          </Button>
        </div>
        
        {selectedActivityId ? (
          <Tabs defaultValue="participants" className="w-full">
            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2">
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="matches">Match Rounds</TabsTrigger>
            </TabsList>
            <TabsContent value="participants" className="mt-6">
              <ParticipantList activityId={selectedActivityId} />
            </TabsContent>
            <TabsContent value="matches" className="mt-6">
              <MatchRounds activityId={selectedActivityId} />
            </TabsContent>
          </Tabs>
        ) : (
          <ActivityList onSelectActivity={setSelectedActivityId} />
        )}
      </div>
    </PageLayout>
  );
};

export default ActivityManagement;

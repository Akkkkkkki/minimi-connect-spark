import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import ActivityList from "@/components/activity-management/ActivityList";
import ParticipantList from "@/components/activity-management/ParticipantList";
import MatchRounds from "@/components/activity-management/MatchRounds";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ActivityManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activityIdParam = searchParams.get('activityId');
  
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(activityIdParam);
  const { isAuthenticated } = useAuth();

  const handleCreateActivity = () => {
    navigate("/create-activity");
  };
  
  const handleBackToList = () => {
    setSelectedActivityId(null);
    setSearchParams({});
  };
  
  const handleSelectActivity = (id: string) => {
    setSelectedActivityId(id);
    setSearchParams({ activityId: id });
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {selectedActivityId ? (
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleBackToList} className="mr-2">
                <ArrowLeft size={16} className="mr-2" />
                Back to All Activities
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">Activity Details</h1>
            </div>
          ) : (
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Organizer Portal</h1>
          )}
          
          {!selectedActivityId && (
            <Button onClick={handleCreateActivity} className="w-full md:w-auto">
              <Plus size={16} className="mr-2" />
              Create Activity
            </Button>
          )}
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
          <ActivityList onSelectActivity={handleSelectActivity} />
        )}
      </div>
    </PageLayout>
  );
};

export default ActivityManagement;

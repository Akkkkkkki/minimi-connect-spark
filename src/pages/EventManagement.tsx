import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import EventList from "@/components/event-management/EventList";
import ParticipantList from "@/components/event-management/ParticipantList";
import MatchRounds from "@/components/event-management/MatchRounds";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const EventManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const eventIdParam = searchParams.get('eventId');
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(eventIdParam);
  const { isAuthenticated } = useAuth();
  const [eventTab, setEventTab] = useState<"upcoming" | "completed">("upcoming");

  const handleCreateEvent = () => {
    navigate("/create-event");
  };
  
  const handleBackToList = () => {
    setSelectedEventId(null);
    setSearchParams({});
  };
  
  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    setSearchParams({ eventId: id });
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {selectedEventId ? (
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleBackToList} className="mr-2">
                <ArrowLeft size={16} className="mr-2" />
                Back to All Activities
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">Event Details</h1>
            </div>
          ) : (
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Organizer Portal</h1>
          )}
          
          {!selectedEventId && (
            <Button onClick={handleCreateEvent} className="w-full md:w-auto">
              <Plus size={16} className="mr-2" />
              Create Event
            </Button>
          )}
        </div>
        
        {selectedEventId ? (
          <Tabs defaultValue="participants" className="w-full">
            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2">
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="matches">Match Rounds</TabsTrigger>
            </TabsList>
            <TabsContent value="participants" className="mt-6">
              <ParticipantList eventId={selectedEventId} />
            </TabsContent>
            <TabsContent value="matches" className="mt-6">
              <MatchRounds eventId={selectedEventId} />
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <Tabs defaultValue={eventTab} className="w-full" onValueChange={v => setEventTab(v as "upcoming" | "completed")}>
              <TabsList className="w-full md:w-auto grid grid-cols-2 mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            <EventList onSelectEvent={handleSelectEvent} statusFilter={eventTab} />
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default EventManagement;

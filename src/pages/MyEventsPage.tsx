import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JoinedActivities from "@/components/profile/JoinedActivities";
import { useAuth } from "@/context/AuthContext";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import EventDetails from "../components/events/EventDetails";
import MatchesList from "../components/match/ConnectionsList";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const MyEventsPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const eventIdParam = searchParams.get('eventId') || "";
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(eventIdParam);
  const { eventId } = useParams();
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
  
  // If there's an eventId in the URL params, use it
  useEffect(() => {
    if (eventId) {
      setSelectedEventId(eventId);
    }
  }, [eventId]);
  
  const handleBackToList = () => {
    setSelectedEventId(null);
    setSearchParams({});
  };
  
  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    setSearchParams({ eventId: id });
  };

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
        {selectedEventId ? (
          <>
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleBackToList} className="mr-2">
                <ArrowLeft size={16} className="mr-2" />
                Back to All Events
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">Event Details</h1>
            </div>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2">
                <TabsTrigger value="details">Event Details</TabsTrigger>
                <TabsTrigger value="matches">Matches</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-6">
                <EventDetails eventId={selectedEventId} />
              </TabsContent>
              <TabsContent value="matches" className="mt-6">
                <MatchesList eventId={selectedEventId} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">My Events</h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Here are the events you've joined or created. Stay up to date with your upcoming and past events.
            </p>
            <JoinedActivities onSelectEvent={handleSelectEvent} />
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default MyEventsPage;

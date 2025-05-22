import PageLayout from "@/components/layout/PageLayout";
import MatchList from "@/components/matches/MatchList";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the event structure returned from Supabase
interface UserEvent {
  id: number;
  title: string;
  start_time: string;
  end_time: string | null;
}

const MatchesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [userActivities, setUserActivities] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("recommended");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please sign in to view your matches", {
        description: "You'll be redirected to the login page"
      });
      setTimeout(() => navigate("/login"), 1500);
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchUserActivities = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const now = new Date().toISOString();
        
        // Query event_participant table to get activities the user participates in
        const { data, error } = await supabase
          .from('event_participant')
          .select(`
            event:event_id (
              id,
              title,
              start_time,
              end_time
            )
          `)
          .eq('profile_id', user.id);
        
        if (error) throw error;
        
        if (!data) {
          setUserActivities([]);
          return;
        }
        
        // Extract activities from the response
        const activities: UserEvent[] = [];
        data.forEach((item: any) => {
          if (item.event && typeof item.event === 'object') {
            activities.push(item.event as UserEvent);
          }
        });
        
        // Find current/ongoing activities
        const ongoingActivities = activities.filter(event => {
          const isStarted = new Date(event.start_time) <= new Date(now);
          const isNotEnded = !event.end_time || new Date(event.end_time) > new Date(now);
          return isStarted && isNotEnded;
        });
        
        setUserActivities(activities);
        
        // Set first ongoing event as default selection
        if (ongoingActivities.length > 0) {
          setSelectedEvent(ongoingActivities[0].id.toString());
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast.error("Failed to load your activities");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserActivities();
  }, [user]);

  if (isLoading || loading) {
    return (
      <PageLayout>
        <div className="space-y-6 mt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Loading...</h1>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Matches</h1>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="history">Match History</TabsTrigger>
          </TabsList>
          <TabsContent value="recommended">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-4">
              <h2 className="text-xl font-medium">Recommended Profiles</h2>
              <Select 
                value={selectedEvent} 
                onValueChange={setSelectedEvent}
              >
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  {userActivities.map(event => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <MatchList eventId={selectedEvent === "all" ? undefined : selectedEvent} />
          </TabsContent>
          <TabsContent value="history">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-4">
              <h2 className="text-xl font-medium">Match History</h2>
              <Select 
                value={selectedEvent} 
                onValueChange={setSelectedEvent}
              >
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  {userActivities.map(event => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <MatchList eventId={selectedEvent === "all" ? undefined : selectedEvent} historyMode />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default MatchesPage;

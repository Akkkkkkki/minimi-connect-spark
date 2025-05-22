import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';

interface Event {
  id: number;
  title: string;
  location: string;
  start_time: string;
  end_time: string | null;
  event_type: string;
  tags: string[];
}

interface JoinedActivitiesProps {
  onSelectEvent?: (id: string) => void;
}

const JoinedActivities = ({ onSelectEvent }: JoinedActivitiesProps) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoinedActivities = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Query the event_participant table to get activities the user has joined
        const { data: participantData, error: participantError } = await supabase
          .from('event_participant')
          .select('event_id')
          .eq('profile_id', user.id);
        
        if (participantError) throw participantError;
        
        if (participantData && participantData.length > 0) {
          const eventIds = participantData.map(p => p.event_id);
          
          // Get the activities based on the IDs
          const { data: activitiesData, error: activitiesError } = await supabase
            .from('event')
            .select('*')
            .in('id', eventIds)
            .order('start_time', { ascending: false });
            
          if (activitiesError) throw activitiesError;
          
          setActivities(activitiesData || []);
        } else {
          setActivities([]);
        }
      } catch (error) {
        console.error("Error fetching joined activities:", error);
        toast.error("Failed to load your activities");
      } finally {
        setLoading(false);
      }
    };
    
    fetchJoinedActivities();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">You haven't joined any activities yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((event) => (
        <Card 
          key={event.id.toString()} 
          className={onSelectEvent ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
          onClick={onSelectEvent ? () => onSelectEvent(event.id.toString()) : undefined}
        >
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{event.title}</h3>
                <Badge variant="outline">{event.event_type}</Badge>
              </div>
              
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{event.location}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{new Date(event.start_time).toLocaleDateString()}</span>
                </div>
              </div>
              
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {event.tags.slice(0, 5).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JoinedActivities;

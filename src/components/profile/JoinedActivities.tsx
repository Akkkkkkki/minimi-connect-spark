import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';

interface Activity {
  id: number;
  title: string;
  location: string;
  start_time: string;
  end_time: string | null;
  activity_type: string;
}

interface JoinedActivitiesProps {
  onSelectActivity?: (id: string) => void;
}

const JoinedActivities = ({ onSelectActivity }: JoinedActivitiesProps) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoinedActivities = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Query the activity_participant table to get activities the user has joined
        const { data, error } = await supabase
          .from('activity_participant')
          .select(`
            activity:activity_id (
              id,
              title,
              location,
              start_time,
              end_time,
              activity_type
            )
          `)
          .eq('profile_id', user.id);
        
        if (error) throw error;
        
        // Extract unique activities
        const uniqueActivities = data ? data.reduce((acc: Activity[], item: any) => {
          if (item.activity && !acc.some((a) => a.id === item.activity.id)) {
            acc.push(item.activity as Activity);
          }
          return acc;
        }, []) : [];
        
        // Sort by start time (most recent first)
        uniqueActivities.sort((a, b) => 
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
        
        setActivities(uniqueActivities);
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
      {activities.map((activity) => (
        <Card 
          key={activity.id} 
          className={onSelectActivity ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
          onClick={onSelectActivity ? () => onSelectActivity(activity.id.toString()) : undefined}
        >
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{activity.title}</h3>
                <Badge variant="outline">{activity.activity_type}</Badge>
              </div>
              
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{activity.location}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{new Date(activity.start_time).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JoinedActivities;

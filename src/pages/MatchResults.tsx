
import PageLayout from "@/components/layout/PageLayout";
import MatchList from "@/components/matches/MatchList";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Updated interface to match the actual structure from Supabase
interface UserActivity {
  id: number;
  title: string;
  start_time: string;
  end_time: string | null;
}

interface ActivityParticipation {
  activity: UserActivity;
}

const MatchResults = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState<string>("all");
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please sign in to view your recommendations", {
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
        
        const { data: participations, error: participationsError } = await supabase
          .from('activity_participant')
          .select(`
            activity:activity (
              id,
              title,
              start_time,
              end_time
            )
          `)
          .eq('profile_id', user.id);
          
        if (participationsError) throw participationsError;
        
        // Transform the data structure to extract activities
        const activities: UserActivity[] = participations
          .map((p: ActivityParticipation) => p.activity)
          .filter((a): a is UserActivity => a !== null);
        
        // Find current/ongoing activities
        const ongoingActivities = activities.filter(activity => {
          const isStarted = new Date(activity.start_time) <= new Date(now);
          const isNotEnded = !activity.end_time || new Date(activity.end_time) > new Date(now);
          return isStarted && isNotEnded;
        });
        
        setUserActivities(activities);
        
        // Set first ongoing activity as default selection
        if (ongoingActivities.length > 0) {
          setSelectedActivity(ongoingActivities[0].id.toString());
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
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Recommended Profiles</h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Here are your current recommended profiles. Provide feedback to help us improve your future matches.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <h2 className="text-xl font-medium">Recommended Profiles</h2>
          <Select 
            value={selectedActivity} 
            onValueChange={setSelectedActivity}
          >
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select an activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              {userActivities.map(activity => (
                <SelectItem key={activity.id} value={activity.id.toString()}>
                  {activity.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <MatchList activityId={selectedActivity === "all" ? undefined : selectedActivity} />
      </div>
    </PageLayout>
  );
};

export default MatchResults;

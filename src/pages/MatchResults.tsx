
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

interface UserActivity {
  id: string;
  name: string;
  startTime: string;
  endTime: string | null;
}

const MatchResults = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState("all");
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [currentActivities, setCurrentActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
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
        
        // Fetch user's joined activities
        const { data: activities, error } = await supabase
          .from('activity_participants')
          .select(`
            activity_id,
            activities (
              id, 
              title, 
              start_time,
              end_time
            )
          `)
          .eq('profile_id', user.id);
          
        if (error) throw error;
        
        const processedActivities = activities
          .filter(item => item.activities) // Filter out any null activities
          .map(item => ({
            id: item.activities.id,
            name: item.activities.title,
            startTime: item.activities.start_time,
            endTime: item.activities.end_time || null
          }));
        
        setUserActivities(processedActivities);
        
        // Find current/ongoing activities
        const ongoing = processedActivities.filter(activity => {
          const isStarted = activity.startTime <= now;
          const isNotEnded = !activity.endTime || activity.endTime > now;
          return isStarted && isNotEnded;
        });
        
        setCurrentActivities(ongoing);
        
        // If there are ongoing activities, set the first one as default selection
        if (ongoing.length > 0 && ongoing[0]) {
          setSelectedActivity(ongoing[0].id);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserActivities();
  }, [user]);

  if (isLoading || loading) {
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
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name}
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

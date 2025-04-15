
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface JoinedActivitiesProps {
  onSelectActivity?: (activityId: string) => void;
}

const JoinedActivities = ({ onSelectActivity }: JoinedActivitiesProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchJoinedActivities = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get all activities the user has joined
        const { data: participations, error: participationsError } = await supabase
          .from('activity_participants')
          .select('activity_id, status, answers')
          .eq('profile_id', user.id);
          
        if (participationsError) throw participationsError;
        
        if (participations && participations.length > 0) {
          // Get the details of each activity
          const activityIds = participations.map(p => p.activity_id);
          
          const { data: activitiesData, error: activitiesError } = await supabase
            .from('activities')
            .select('*')
            .in('id', activityIds);
            
          if (activitiesError) throw activitiesError;
          
          // Combine activity data with participation data
          const joinedActivities = activitiesData.map(activity => {
            const participation = participations.find(p => p.activity_id === activity.id);
            return {
              ...activity,
              status: new Date(activity.start_time) > new Date() ? "upcoming" : "completed",
              hasCompletedQuestionnaire: participation?.answers && Object.keys(participation.answers).length > 0
            };
          });
          
          setActivities(joinedActivities);
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

  const handleViewDetails = (activityId: string) => {
    if (onSelectActivity) {
      onSelectActivity(activityId);
    } else {
      navigate(`/my-activities/${activityId}`);
    }
  };

  const handleCompleteQuestionnaire = (activityId: string) => {
    navigate(`/activities/${activityId}/questionnaire`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <div className="flex justify-end pt-2">
                  <Skeleton className="h-10 w-32" />
                </div>
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
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">You haven't joined any activities yet.</p>
          <p className="mt-2">Browse our activities and join ones that interest you!</p>
          <Button className="mt-4" onClick={() => navigate("/activities")}>
            Browse Activities
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <Card key={activity.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{activity.title}</h3>
                  {activity.status === "upcoming" ? (
                    <Badge>Upcoming</Badge>
                  ) : (
                    <Badge variant="outline">Completed</Badge>
                  )}
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(activity.start_time).toLocaleDateString()} at {new Date(activity.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {activity.location}
                  </div>
                  {activity.participant_count && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {activity.participant_count} participants
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                {activity.status === "upcoming" && !activity.hasCompletedQuestionnaire && (
                  <Button onClick={() => handleCompleteQuestionnaire(activity.id)}>
                    Complete Questionnaire
                  </Button>
                )}
                {activity.status === "upcoming" && activity.hasCompletedQuestionnaire && (
                  <Button variant="outline" onClick={() => handleCompleteQuestionnaire(activity.id)}>
                    Edit Answers
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleViewDetails(activity.id)}
                  className={activity.status === "upcoming" && "ml-2"}
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JoinedActivities;

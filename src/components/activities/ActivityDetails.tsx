
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Tag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

interface ActivityDetailsProps {
  activityId: string;
}

const ActivityDetails = ({ activityId }: ActivityDetailsProps) => {
  const [activity, setActivity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivity = async () => {
      if (!activityId) return;
      
      try {
        setLoading(true);
        
        // Get activity details
        const { data: activityData, error: activityError } = await supabase
          .from('activity')
          .select(`
            *,
            questionnaires (id)
          `)
          .eq('id', activityId)
          .single();
          
        if (activityError) throw activityError;
        
        if (activityData) {
          // Check if current user is a participant
          const { data: participantData } = await supabase
            .from('activity_participant')
            .select('id, status, answers')
            .eq('activity_id', activityId)
            .maybeSingle();
          
          const formattedActivity = {
            ...activityData,
            status: new Date(activityData.start_time) > new Date() ? "upcoming" : "completed",
            hasQuestionnaire: activityData.questionnaires && activityData.questionnaires.length > 0,
            hasCompletedQuestionnaire: participantData && Object.keys(participantData.answers || {}).length > 0,
            isParticipant: !!participantData
          };
          
          setActivity(formattedActivity);
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
        toast.error("Failed to load activity details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivity();
  }, [activityId]);

  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleCompleteQuestionnaire = () => {
    navigate(`/activities/${activityId}/questionnaire`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-8 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activity) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Activity not found</p>
          <Button onClick={handleGoBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = new Date(activity.start_time).toLocaleDateString();
  const formattedTime = new Date(activity.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const tags = activity.tags || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" onClick={handleGoBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl font-bold">{activity.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={activity.status === "upcoming" ? "default" : "outline"}>
            {activity.status === "upcoming" ? "Upcoming" : "Completed"}
          </Badge>
          <Badge variant="secondary">{activity.activity_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">{activity.description}</p>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {tags.slice(0, 5).map((tag: string, index: number) => (
            <Badge key={index} variant="secondary">
              <Tag className="h-3 w-3 mr-1" /> {tag}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {formattedDate}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {formattedTime}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {activity.location}
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            {activity.status === "upcoming" && activity.hasQuestionnaire && (
              <Button onClick={handleCompleteQuestionnaire}>
                {activity.hasCompletedQuestionnaire ? "Edit Answers" : "Complete Questionnaire"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityDetails;

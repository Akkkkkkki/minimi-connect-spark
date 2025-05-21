import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Tag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ActivityDetailsProps {
  activityId: string;
}

const ActivityDetails = ({ activityId }: ActivityDetailsProps) => {
  const [activity, setActivity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [isFull, setIsFull] = useState<boolean>(false);
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState<boolean>(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!activityId) return;
      try {
        setLoading(true);
        // Get activity details and participants
        const { data: activityData, error: activityError } = await supabase
          .from('activity')
          .select(`*, activity_participant (id, profile_id)`)
          .eq('id', activityId)
          .single();
        if (activityError) throw activityError;
        if (activityData) {
          const participants = activityData.activity_participant || [];
          setParticipantCount(participants.length);
          setIsFull(participants.length >= 30);
          let foundParticipantId: number | null = null;
          let foundIsParticipant = false;
          if (user) {
            const found = participants.find((p: any) => p.profile_id === user.id);
            foundIsParticipant = !!found;
            foundParticipantId = found ? found.id : null;
          }
          setIsParticipant(foundIsParticipant);
          setParticipantId(foundParticipantId);

          // Fetch questionnaire for this activity
          const { data: aqData, error: aqError } = await supabase
            .from('activity_questionnaire')
            .select('*')
            .eq('activity_id', activityId)
            .maybeSingle();
          if (aqError) throw aqError;
          const hasQuestionnaire = !!aqData;
          // Calculate status
          const now = new Date();
          let status = "upcoming";
          if (activityData.end_time) {
            status = new Date(activityData.end_time) <= now ? "completed" : "upcoming";
          } else if (activityData.start_time) {
            status = new Date(activityData.start_time) <= now ? "completed" : "upcoming";
          }
          const formattedActivity = {
            ...activityData,
            hasQuestionnaire,
            status,
          };
          setActivity(formattedActivity);
          // Check if questionnaire is completed
          if (foundIsParticipant && foundParticipantId && hasQuestionnaire) {
            const { data: responses, error: respErr } = await supabase
              .from('questionnaire_response')
              .select('id')
              .eq('participant_id', foundParticipantId);
            setHasCompletedQuestionnaire(responses && responses.length > 0);
          } else {
            setHasCompletedQuestionnaire(false);
          }
        }
      } catch (error) {
        toast.error("Failed to load activity details");
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [activityId, user]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }
    if (isFull || isParticipant) return;
    if (activity?.hasQuestionnaire) {
      navigate(`/activities/${activityId}/questionnaire`);
      return;
    }
    // Directly join the activity if no questionnaire
    try {
      const { error } = await supabase
        .from('activity_participant')
        .insert({ activity_id: activityId, profile_id: user.id });
      if (error) throw error;
      toast.success('You have joined the activity!');
      setIsParticipant(true);
      setParticipantCount((prev) => prev + 1);
    } catch (err) {
      toast.error('Failed to join activity.');
    }
  };

  const handleCompleteQuestionnaire = () => {
    navigate(`/activities/${activityId}/questionnaire`);
  };

  const handleLeave = async () => {
    if (!participantId) return;
    setLeaveLoading(true);
    try {
      const { error } = await supabase
        .from('activity_participant')
        .delete()
        .eq('id', participantId);
      if (error) throw error;
      toast.success('You have left the activity.');
      setIsParticipant(false);
      setHasCompletedQuestionnaire(false);
      setParticipantId(null);
      setParticipantCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to leave activity.');
    } finally {
      setLeaveLoading(false);
    }
  };

  const formattedDate = activity ? new Date(activity.start_time).toLocaleDateString() : '';
  const formattedTime = activity ? new Date(activity.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
  const tags = activity?.tags || [];

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
          
          <div className="flex flex-col items-end gap-2">
            {/* Join Button: Only show if not a participant */}
            {activity.status === "upcoming" && !isParticipant && (
              <Button
                onClick={handleJoin}
                disabled={isFull}
                variant="default"
                className="text-white bg-accent hover:bg-accent/90"
              >
                {!isAuthenticated
                  ? "Sign in to join activity"
                  : isFull
                  ? "Event Full"
                  : "Join Activity"}
              </Button>
            )}
            {/* Questionnaire Button: Show if participant, always visible */}
            {isParticipant && (
              <Button
                onClick={handleCompleteQuestionnaire}
                variant="default"
                className="text-white bg-accent hover:bg-accent/90"
              >
                {hasCompletedQuestionnaire ? "View Questionnaire" : "Complete Questionnaire"}
              </Button>
            )}
            {/* Leave Activity Button: Show if participant */}
            {isParticipant && (
              <Button
                onClick={handleLeave}
                variant="destructive"
                className="text-white"
                disabled={leaveLoading}
              >
                {leaveLoading ? 'Leaving...' : 'Leave Activity'}
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          {participantCount}/30 participants
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityDetails;


import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ActivityDetails from "@/components/activities/ActivityDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const ActivityDetailsPage = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activityExists, setActivityExists] = useState(false);
  const [hasQuestionnaire, setHasQuestionnaire] = useState(false);

  useEffect(() => {
    // Check if the activity exists and has a questionnaire
    const checkActivity = async () => {
      if (!activityId) return;
      
      setLoading(true);
      
      try {
        // Check if activity exists
        const { data: activity, error: activityError } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .single();
          
        if (activityError || !activity) {
          setActivityExists(false);
          setLoading(false);
          return;
        }
        
        setActivityExists(true);
        
        // Check if questionnaire exists for this activity
        const { data: questionnaire, error: questionnaireError } = await supabase
          .from('questionnaires')
          .select('*')
          .eq('activity_id', activityId);
          
        setHasQuestionnaire(questionnaire && questionnaire.length > 0);
      } catch (error) {
        console.error("Error checking activity:", error);
        toast.error("Failed to load activity data");
      } finally {
        setLoading(false);
      }
    };
    
    checkActivity();
  }, [activityId]);

  const handleJoin = () => {
    if (!activityId || !hasQuestionnaire) {
      toast.error("This activity doesn't have a questionnaire yet");
      return;
    }
    
    navigate(`/activities/${activityId}/questionnaire`);
  };

  const handleBack = () => {
    navigate('/activities');
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </PageLayout>
    );
  }

  if (!activityId || !activityExists) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <Button variant="ghost" className="flex items-center gap-2" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to Activities
          </Button>
          
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Activity not found</p>
              <Button className="mt-4" onClick={handleBack}>
                Browse Activities
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <Button variant="ghost" className="flex items-center gap-2" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to Activities
        </Button>
        
        <ActivityDetails activityId={activityId} />
        
        <div className="flex justify-center mt-8">
          {hasQuestionnaire ? (
            <Button size="lg" onClick={handleJoin}>
              Join This Activity
            </Button>
          ) : (
            <Button size="lg" variant="outline" disabled>
              Questionnaire not available
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ActivityDetailsPage;

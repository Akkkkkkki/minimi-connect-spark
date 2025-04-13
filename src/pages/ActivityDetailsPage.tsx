import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ActivityDetails from "@/components/activities/ActivityDetails";
import { Skeleton } from "@/components/ui/skeleton";

const ActivityDetailsPage = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activityExists, setActivityExists] = useState(false);

  useEffect(() => {
    // In a real app this would check if the activity exists
    const checkActivity = async () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        // For demo purposes, we'll assume all IDs exist
        setActivityExists(true);
        setLoading(false);
      }, 500);
    };
    
    if (activityId) {
      checkActivity();
    } else {
      setLoading(false);
    }
  }, [activityId]);

  const handleJoin = () => {
    // In a real app, this would register the user for the activity
    // and redirect to the questionnaire
    if (activityId) {
      navigate(`/activities/${activityId}/questionnaire`);
    }
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
          <Button size="lg" onClick={handleJoin}>
            Join This Activity
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default ActivityDetailsPage; 
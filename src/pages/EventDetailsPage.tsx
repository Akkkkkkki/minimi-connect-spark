import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EventDetails from "@/components/events/EventDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const EventDetailsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [eventExists, setEventExists] = useState(false);
  const [hasQuestionnaire, setHasQuestionnaire] = useState(false);

  useEffect(() => {
    // Check if the event exists and has a questionnaire
    const checkEvent = async () => {
      if (!eventId) return;
      
      setLoading(true);
      
      try {
        // Check if event exists
        const { data: event, error: eventError } = await supabase
          .from('event')
          .select('*')
          .eq('id', eventId)
          .single();
          
        if (eventError) {
          setEventExists(false);
          setLoading(false);
          toast.error("Event not found");
          setTimeout(() => navigate('/events'), 1500);
          return;
        }
        
        setEventExists(true);
        
        // Check if questionnaire exists for this event
        const { data: aqData, error: aqError } = await supabase
          .from('event_questionnaire')
          .select('*')
          .eq('event_id', eventId);
        setHasQuestionnaire(aqData && aqData.length > 0);
      } catch (error) {
        toast.error("Failed to load event data");
      } finally {
        setLoading(false);
      }
    };
    
    checkEvent();
  }, [eventId, navigate]);

  const handleJoin = () => {
    if (!eventId || !hasQuestionnaire) {
      toast.error("This event doesn't have a questionnaire yet");
      return;
    }
    
    navigate(`/events/${eventId}/questionnaire`);
  };

  const handleBack = () => {
    navigate('/events');
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

  if (!eventId || !eventExists) {
    return (
      <PageLayout>
        <div className="space-y-4">
          <Button variant="ghost" className="flex items-center gap-2" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to All Events
          </Button>
          
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Event not found</p>
              <Button className="mt-4" onClick={handleBack}>
                Browse All Events
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
          Back to All Events
        </Button>
        
        <EventDetails eventId={eventId} />
      </div>
    </PageLayout>
  );
};

export default EventDetailsPage;

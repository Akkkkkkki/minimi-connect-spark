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
import { getTicketTypeAvailability, getUserTicketStatus, reserveOrWaitlistTicket, getEventTicketSetting } from '@/services/ticketing';

interface EventDetailsProps {
  eventId: string;
}

const EventDetails = ({ eventId }: EventDetailsProps) => {
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [isFull, setIsFull] = useState<boolean>(false);
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState<boolean>(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [ticketTypeStatus, setTicketTypeStatus] = useState<any[]>([]);
  const [userTicketStatus, setUserTicketStatus] = useState<any>(null);
  const [ticketSetting, setTicketSetting] = useState<any>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
        // Get event details and participants
        const { data: eventData, error: eventError } = await supabase
          .from('event')
          .select(`*, event_participant (id, profile_id)`)
          .eq('id', eventId)
          .single();
        if (eventError) throw eventError;
        if (eventData) {
          const participants = eventData.event_participant || [];
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

          // Fetch questionnaire for this event
          const { data: aqData, error: aqError } = await supabase
            .from('event_questionnaire')
            .select('*')
            .eq('event_id', eventId)
            .maybeSingle();
          if (aqError) throw aqError;
          const hasQuestionnaire = !!aqData;
          // Calculate status
          const now = new Date();
          let status = "upcoming";
          if (eventData.end_time) {
            status = new Date(eventData.end_time) <= now ? "completed" : "upcoming";
          } else if (eventData.start_time) {
            status = new Date(eventData.start_time) <= now ? "completed" : "upcoming";
          }
          const formattedEvent = {
            ...eventData,
            hasQuestionnaire,
            status,
          };
          setEvent(formattedEvent);
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

          // Fetch ticket type status
          const { data: typeStatus } = await getTicketTypeAvailability(eventId);
          setTicketTypeStatus(typeStatus || []);
          // Fetch ticket setting
          const { data: setting } = await getEventTicketSetting(eventId);
          setTicketSetting(setting);
          // Fetch user ticket status
          if (user) {
            const { status: userStatus, ticket } = await getUserTicketStatus(eventId, user.id);
            setUserTicketStatus({ status: userStatus, ticket });
          } else {
            setUserTicketStatus(null);
          }
        }
      } catch (error) {
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, user]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }
    if (isFull || isParticipant) return;
    if (!ticketTypeStatus.length) return;
    // Pick first available ticket type
    const availableType = ticketTypeStatus.find(t => !t.isFull);
    if (!availableType && ticketSetting?.allow_waitlist) {
      // All full, but waitlist enabled
      const typeToWaitlist = ticketTypeStatus[0];
      const { error } = await reserveOrWaitlistTicket({
        eventId,
        ticketTypeId: typeToWaitlist.id,
        profileId: user.id,
        allowWaitlist: true,
      });
      if (error) {
        toast.error(error.message || 'Could not join waitlist.');
        return;
      }
      toast.success('You have joined the waitlist!');
      setUserTicketStatus({ status: 'waitlisted' });
      return;
    }
    if (availableType) {
      const { error } = await reserveOrWaitlistTicket({
        eventId,
        ticketTypeId: availableType.id,
        profileId: user.id,
        allowWaitlist: !!ticketSetting?.allow_waitlist,
      });
      if (error) {
        toast.error(error.message || 'Could not reserve ticket.');
        return;
      }
      toast.success('Ticket reserved!');
      setUserTicketStatus({ status: 'reserved' });
      return;
    }
    toast.error('No tickets available.');
  };

  const handleCompleteQuestionnaire = () => {
    navigate(`/events/${eventId}/questionnaire`);
  };

  const handleLeave = async () => {
    if (!participantId) return;
    setLeaveLoading(true);
    try {
      const { error } = await supabase
        .from('event_participant')
        .delete()
        .eq('id', participantId);
      if (error) throw error;
      toast.success('You have left the event.');
      setIsParticipant(false);
      setHasCompletedQuestionnaire(false);
      setParticipantId(null);
      setParticipantCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to leave event.');
    } finally {
      setLeaveLoading(false);
    }
  };

  const formattedDate = event ? new Date(event.start_time).toLocaleDateString() : '';
  const formattedTime = event ? new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
  const tags = event?.tags || [];

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

  if (!event) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Event not found</p>
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
          <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={event.status === "upcoming" ? "default" : "outline"}>
            {event.status === "upcoming" ? "Upcoming" : "Completed"}
          </Badge>
          <Badge variant="secondary">{event.event_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">{event.description}</p>
        
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
              {event.location}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {/* Join Button: Only show if not a participant */}
            {event.status === "upcoming" && !isParticipant && (
              <Button
                onClick={handleJoin}
                disabled={isFull}
                variant="default"
                className="text-white bg-accent hover:bg-accent/90"
              >
                {!isAuthenticated
                  ? "Sign in to join event"
                  : isFull
                  ? "Event Full"
                  : "Join Event"}
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
            {/* Leave Event Button: Show if participant */}
            {isParticipant && (
              <Button
                onClick={handleLeave}
                variant="destructive"
                className="text-white"
                disabled={leaveLoading}
              >
                {leaveLoading ? 'Leaving...' : 'Leave Event'}
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-2" />
          {participantCount}/30 participants
        </div>
        {/* Ticket type status badges */}
        {ticketTypeStatus.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {ticketTypeStatus.map(type => (
              <Badge key={type.id} variant={type.isFull ? "destructive" : "default"}>
                {type.name}: {type.isFull ? (ticketSetting?.allow_waitlist ? "Waitlist" : "Full") : `${type.available} left`}
              </Badge>
            ))}
          </div>
        )}
        {/* User's ticket status */}
        {userTicketStatus?.status && userTicketStatus.status !== 'none' && (
          <div className="mb-2">
            <Badge variant={userTicketStatus.status === 'reserved' ? 'default' : 'secondary'}>
              {userTicketStatus.status === 'reserved' ? 'Ticket Reserved' : 'Waitlisted'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventDetails;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
const ActivityDetails = ({ activityId }) => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, user } = useAuth();
    const [participantCount, setParticipantCount] = useState(0);
    const [isParticipant, setIsParticipant] = useState(false);
    const [isFull, setIsFull] = useState(false);
    const [participantId, setParticipantId] = useState(null);
    const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    useEffect(() => {
        const fetchActivity = async () => {
            if (!activityId)
                return;
            try {
                setLoading(true);
                // Get activity details and participants
                const { data: activityData, error: activityError } = await supabase
                    .from('activity')
                    .select(`*, activity_participant (id, profile_id)`)
                    .eq('id', activityId)
                    .single();
                if (activityError)
                    throw activityError;
                if (activityData) {
                    const participants = activityData.activity_participant || [];
                    setParticipantCount(participants.length);
                    setIsFull(participants.length >= 30);
                    let foundParticipantId = null;
                    let foundIsParticipant = false;
                    if (user) {
                        const found = participants.find((p) => p.profile_id === user.id);
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
                    if (aqError)
                        throw aqError;
                    const hasQuestionnaire = !!aqData;
                    // Calculate status
                    const now = new Date();
                    let status = "upcoming";
                    if (activityData.end_time) {
                        status = new Date(activityData.end_time) <= now ? "completed" : "upcoming";
                    }
                    else if (activityData.start_time) {
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
                    }
                    else {
                        setHasCompletedQuestionnaire(false);
                    }
                }
            }
            catch (error) {
                toast.error("Failed to load activity details");
            }
            finally {
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
        if (isFull || isParticipant)
            return;
        if (activity?.hasQuestionnaire) {
            navigate(`/activities/${activityId}/questionnaire`);
            return;
        }
        // Directly join the activity if no questionnaire
        try {
            const { error } = await supabase
                .from('activity_participant')
                .insert({ activity_id: activityId, profile_id: user.id });
            if (error)
                throw error;
            toast.success('You have joined the activity!');
            setIsParticipant(true);
            setParticipantCount((prev) => prev + 1);
        }
        catch (err) {
            toast.error('Failed to join activity.');
        }
    };
    const handleCompleteQuestionnaire = () => {
        navigate(`/activities/${activityId}/questionnaire`);
    };
    const handleLeave = async () => {
        if (!participantId)
            return;
        setLeaveLoading(true);
        try {
            const { error } = await supabase
                .from('activity_participant')
                .delete()
                .eq('id', participantId);
            if (error)
                throw error;
            toast.success('You have left the activity.');
            setIsParticipant(false);
            setHasCompletedQuestionnaire(false);
            setParticipantId(null);
            setParticipantCount((prev) => Math.max(0, prev - 1));
        }
        catch (err) {
            toast.error('Failed to leave activity.');
        }
        finally {
            setLeaveLoading(false);
        }
    };
    const formattedDate = activity ? new Date(activity.start_time).toLocaleDateString() : '';
    const formattedTime = activity ? new Date(activity.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const tags = activity?.tags || [];
    if (loading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(Skeleton, { className: "h-8 w-2/3" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Skeleton, { className: "h-4 w-full" }), _jsx(Skeleton, { className: "h-4 w-full" }), _jsx(Skeleton, { className: "h-4 w-3/4" }), _jsxs("div", { className: "space-y-2 pt-4", children: [_jsx(Skeleton, { className: "h-4 w-1/2" }), _jsx(Skeleton, { className: "h-4 w-1/2" }), _jsx(Skeleton, { className: "h-4 w-1/2" })] })] })] }));
    }
    if (!activity) {
        return (_jsx(Card, { children: _jsxs(CardContent, { className: "py-10 text-center", children: [_jsx("p", { className: "text-muted-foreground", children: "Activity not found" }), _jsxs(Button, { onClick: handleGoBack, className: "mt-4", children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), " Back"] })] }) }));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: handleGoBack, className: "mr-2", children: _jsx(ArrowLeft, { className: "h-4 w-4" }) }), _jsx(CardTitle, { className: "text-2xl font-bold", children: activity.title })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: activity.status === "upcoming" ? "default" : "outline", children: activity.status === "upcoming" ? "Upcoming" : "Completed" }), _jsx(Badge, { variant: "secondary", children: activity.activity_type })] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-gray-600", children: activity.description }), _jsx("div", { className: "flex flex-wrap gap-2 pt-2", children: tags.slice(0, 5).map((tag, index) => (_jsxs(Badge, { variant: "secondary", children: [_jsx(Tag, { className: "h-3 w-3 mr-1" }), " ", tag] }, index))) }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center text-sm text-muted-foreground", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), formattedDate] }), _jsxs("div", { className: "flex items-center text-sm text-muted-foreground", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), formattedTime] }), _jsxs("div", { className: "flex items-center text-sm text-muted-foreground", children: [_jsx(MapPin, { className: "h-4 w-4 mr-2" }), activity.location] })] }), _jsxs("div", { className: "flex flex-col items-end gap-2", children: [activity.status === "upcoming" && !isParticipant && (_jsx(Button, { onClick: handleJoin, disabled: isFull, variant: "default", className: "text-white bg-accent hover:bg-accent/90", children: !isAuthenticated
                                            ? "Sign in to join activity"
                                            : isFull
                                                ? "Event Full"
                                                : "Join Activity" })), isParticipant && (_jsx(Button, { onClick: handleCompleteQuestionnaire, variant: "default", className: "text-white bg-accent hover:bg-accent/90", children: hasCompletedQuestionnaire ? "View Questionnaire" : "Complete Questionnaire" })), isParticipant && (_jsx(Button, { onClick: handleLeave, variant: "destructive", className: "text-white", disabled: leaveLoading, children: leaveLoading ? 'Leaving...' : 'Leave Activity' }))] })] }), _jsxs("div", { className: "flex items-center text-sm text-muted-foreground", children: [_jsx(Users, { className: "h-4 w-4 mr-2" }), participantCount, "/30 participants"] })] })] }));
};
export default ActivityDetails;

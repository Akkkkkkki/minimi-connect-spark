import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const { activityId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activityExists, setActivityExists] = useState(false);
    const [hasQuestionnaire, setHasQuestionnaire] = useState(false);
    useEffect(() => {
        // Check if the activity exists and has a questionnaire
        const checkActivity = async () => {
            if (!activityId)
                return;
            setLoading(true);
            try {
                // Check if activity exists
                const { data: activity, error: activityError } = await supabase
                    .from('activity')
                    .select('*')
                    .eq('id', activityId)
                    .single();
                if (activityError) {
                    setActivityExists(false);
                    setLoading(false);
                    toast.error("Activity not found");
                    setTimeout(() => navigate('/activities'), 1500);
                    return;
                }
                setActivityExists(true);
                // Check if questionnaire exists for this activity
                const { data: aqData, error: aqError } = await supabase
                    .from('activity_questionnaire')
                    .select('*')
                    .eq('activity_id', activityId);
                setHasQuestionnaire(aqData && aqData.length > 0);
            }
            catch (error) {
                toast.error("Failed to load activity data");
            }
            finally {
                setLoading(false);
            }
        };
        checkActivity();
    }, [activityId, navigate]);
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
        return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: handleBack, className: "h-8 w-8", children: _jsx(ArrowLeft, { className: "h-4 w-4" }) }), _jsx(Skeleton, { className: "h-8 w-48" })] }), _jsx(Skeleton, { className: "h-[400px] w-full" })] }) }));
    }
    if (!activityId || !activityExists) {
        return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Button, { variant: "ghost", className: "flex items-center gap-2", onClick: handleBack, children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to All Activities"] }), _jsx(Card, { children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx("p", { className: "text-muted-foreground", children: "Activity not found" }), _jsx(Button, { className: "mt-4", onClick: handleBack, children: "Browse All Activities" })] }) })] }) }));
    }
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Button, { variant: "ghost", className: "flex items-center gap-2", onClick: handleBack, children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to All Activities"] }), _jsx(ActivityDetails, { activityId: activityId })] }) }));
};
export default ActivityDetailsPage;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
const JoinedActivities = ({ onSelectActivity }) => {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchJoinedActivities = async () => {
            if (!user)
                return;
            try {
                setLoading(true);
                // Query the activity_participant table to get activities the user has joined
                const { data: participantData, error: participantError } = await supabase
                    .from('activity_participant')
                    .select('activity_id')
                    .eq('profile_id', user.id);
                if (participantError)
                    throw participantError;
                if (participantData && participantData.length > 0) {
                    const activityIds = participantData.map(p => p.activity_id);
                    // Get the activities based on the IDs
                    const { data: activitiesData, error: activitiesError } = await supabase
                        .from('activity')
                        .select('*')
                        .in('id', activityIds)
                        .order('start_time', { ascending: false });
                    if (activitiesError)
                        throw activitiesError;
                    setActivities(activitiesData || []);
                }
                else {
                    setActivities([]);
                }
            }
            catch (error) {
                console.error("Error fetching joined activities:", error);
                toast.error("Failed to load your activities");
            }
            finally {
                setLoading(false);
            }
        };
        fetchJoinedActivities();
    }, [user]);
    if (loading) {
        return (_jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsx(Skeleton, { className: "h-6 w-3/4 mb-2" }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Skeleton, { className: "h-4 w-1/3" }), _jsx(Skeleton, { className: "h-4 w-1/3" })] })] }) }, i))) }));
    }
    if (activities.length === 0) {
        return (_jsx(Card, { children: _jsx(CardContent, { className: "p-6 text-center", children: _jsx("p", { className: "text-muted-foreground", children: "You haven't joined any activities yet." }) }) }));
    }
    return (_jsx("div", { className: "space-y-4", children: activities.map((activity) => (_jsx(Card, { className: onSelectActivity ? "cursor-pointer hover:shadow-md transition-shadow" : "", onClick: onSelectActivity ? () => onSelectActivity(activity.id.toString()) : undefined, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsx("h3", { className: "font-medium", children: activity.title }), _jsx(Badge, { variant: "outline", children: activity.activity_type })] }), _jsxs("div", { className: "flex flex-wrap gap-3 text-sm text-muted-foreground", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(MapPin, { size: 14 }), _jsx("span", { children: activity.location })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { size: 14 }), _jsx("span", { children: new Date(activity.start_time).toLocaleDateString() })] })] }), activity.tags && activity.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: activity.tags.slice(0, 5).map((tag, index) => (_jsx(Badge, { variant: "secondary", className: "text-xs", children: tag }, index))) }))] }) }) }, activity.id.toString()))) }));
};
export default JoinedActivities;

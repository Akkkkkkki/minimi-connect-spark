import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, MapPin, MoreVertical, Settings, Trash, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
const ActivityList = ({ onSelectActivity, statusFilter = 'upcoming' }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchActivities = async () => {
            if (!user)
                return;
            try {
                setLoading(true);
                // Get activities created by this user
                const { data, error } = await supabase
                    .from('activity')
                    .select(`*, activity_questionnaire (id), activity_participant (id)`)
                    .eq('creator_id', user.id);
                if (error)
                    throw error;
                if (data) {
                    // Process and format activity data
                    const processedActivities = data.map(activity => {
                        const hasQuestionnaire = activity.activity_questionnaire && activity.activity_questionnaire.length > 0;
                        const now = new Date();
                        let status = "upcoming";
                        if (activity.end_time) {
                            status = new Date(activity.end_time) <= now ? "completed" : "upcoming";
                        }
                        else if (activity.start_time) {
                            status = new Date(activity.start_time) <= now ? "completed" : "upcoming";
                        }
                        return {
                            ...activity,
                            status,
                            participants: activity.activity_participant ? activity.activity_participant.length : 0,
                            hasQuestionnaire
                        };
                    });
                    setActivities(processedActivities);
                }
            }
            catch (error) {
                console.error("Error fetching activities:", error);
                toast.error("Failed to load your activities");
            }
            finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [user]);
    const handleEdit = (id) => {
        navigate(`/edit-activity/${id}`);
    };
    const handleDelete = (id) => {
        toast.info("Delete functionality not implemented in demo");
    };
    const handleManageMatches = (id) => {
        onSelectActivity(id);
    };
    const handleEditQuestionnaire = (id) => {
        navigate(`/activity-management/${id}/questionnaire`);
    };
    if (loading) {
        return (_jsx("div", { className: "space-y-4", children: [1, 2].map((index) => (_jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsx(Skeleton, { className: "h-8 w-1/3 mb-4" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-1/2" }), _jsx(Skeleton, { className: "h-4 w-1/2" }), _jsx(Skeleton, { className: "h-4 w-1/4" })] }), _jsxs("div", { className: "flex justify-end mt-4", children: [_jsx(Skeleton, { className: "h-10 w-24 mr-2" }), _jsx(Skeleton, { className: "h-10 w-24" })] })] }) }, index))) }));
    }
    if (activities.length === 0) {
        return (_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6 text-center py-12", children: [_jsx("p", { className: "text-muted-foreground", children: "You haven't created any activities yet." }), _jsx(Button, { className: "mt-4", onClick: () => navigate("/create-activity"), children: "Create Your First Activity" })] }) }));
    }
    // Filter activities by statusFilter
    const filteredActivities = activities.filter(activity => activity.status === statusFilter);
    if (filteredActivities.length === 0) {
        return (_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6 text-center py-12", children: [_jsxs("p", { className: "text-muted-foreground", children: ["No ", statusFilter, " activities found."] }), _jsx(Button, { className: "mt-4", onClick: () => navigate("/create-activity"), children: "Create Activity" })] }) }));
    }
    return (_jsx("div", { className: "space-y-4", children: filteredActivities.map(activity => (_jsx(Card, { className: "overflow-hidden", children: _jsx(CardContent, { className: "p-6", children: _jsx("div", { className: "flex flex-col gap-4", children: _jsxs("div", { className: "flex flex-row justify-between items-start gap-2", children: [_jsxs("div", { className: "space-y-2 flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("h3", { className: "text-lg font-medium truncate", children: activity.title }), activity.status === "upcoming" ? (_jsx(Badge, { children: "Upcoming" })) : (_jsx(Badge, { variant: "outline", children: "Completed" })), activity.hasQuestionnaire && (_jsx(Badge, { variant: "secondary", children: "Has Questionnaire" }))] }), _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsxs("div", { className: "flex items-center text-sm text-muted-foreground", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), new Date(activity.start_time).toLocaleDateString(), " at ", new Date(activity.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })] }), _jsxs("div", { className: "flex items-center text-sm text-muted-foreground", children: [_jsx(MapPin, { className: "h-4 w-4 mr-2" }), activity.location] }), _jsxs("div", { className: "flex items-center text-sm text-muted-foreground", children: [_jsx(Users, { className: "h-4 w-4 mr-2" }), activity.participants, " participants"] })] })] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", children: [_jsx("span", { className: "sr-only", children: "Open menu" }), _jsx(MoreVertical, { className: "h-4 w-4" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuLabel, { children: "Actions" }), _jsx(DropdownMenuSeparator, {}), activity.status === "upcoming" && (_jsxs(DropdownMenuItem, { onClick: () => handleEdit(activity.id), children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), " Edit"] })), _jsxs(DropdownMenuItem, { onClick: () => handleManageMatches(activity.id), children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), " Manage Matches"] }), activity.status === "upcoming" && (_jsxs(DropdownMenuItem, { onClick: () => handleEditQuestionnaire(activity.id), children: [_jsx(Edit, { className: "mr-2 h-4 w-4" }), activity.hasQuestionnaire ? 'Edit' : 'Create', " Questionnaire"] })), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { className: "text-red-600", onClick: () => handleDelete(activity.id), children: [_jsx(Trash, { className: "mr-2 h-4 w-4" }), " Delete"] })] })] })] }) }) }) }, activity.id.toString()))) }));
};
export default ActivityList;

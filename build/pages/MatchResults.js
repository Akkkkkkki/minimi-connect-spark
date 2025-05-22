import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PageLayout from "@/components/layout/PageLayout";
import MatchList from "@/components/matches/MatchList";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
const MatchesPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, user } = useAuth();
    const [selectedActivity, setSelectedActivity] = useState("all");
    const [userActivities, setUserActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("recommended");
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            toast.error("Please sign in to view your matches", {
                description: "You'll be redirected to the login page"
            });
            setTimeout(() => navigate("/login"), 1500);
        }
    }, [isAuthenticated, isLoading, navigate]);
    useEffect(() => {
        const fetchUserActivities = async () => {
            if (!user)
                return;
            try {
                setLoading(true);
                const now = new Date().toISOString();
                // Query activity_participant table to get activities the user participates in
                const { data, error } = await supabase
                    .from('activity_participant')
                    .select(`
            activity:activity_id (
              id,
              title,
              start_time,
              end_time
            )
          `)
                    .eq('profile_id', user.id);
                if (error)
                    throw error;
                if (!data) {
                    setUserActivities([]);
                    return;
                }
                // Extract activities from the response
                const activities = [];
                data.forEach((item) => {
                    if (item.activity && typeof item.activity === 'object') {
                        activities.push(item.activity);
                    }
                });
                // Find current/ongoing activities
                const ongoingActivities = activities.filter(activity => {
                    const isStarted = new Date(activity.start_time) <= new Date(now);
                    const isNotEnded = !activity.end_time || new Date(activity.end_time) > new Date(now);
                    return isStarted && isNotEnded;
                });
                setUserActivities(activities);
                // Set first ongoing activity as default selection
                if (ongoingActivities.length > 0) {
                    setSelectedActivity(ongoingActivities[0].id.toString());
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
        fetchUserActivities();
    }, [user]);
    if (isLoading || loading) {
        return (_jsx(PageLayout, { children: _jsx("div", { className: "space-y-6 mt-4", children: _jsx("h1", { className: "text-3xl md:text-4xl font-bold text-primary", children: "Loading..." }) }) }));
    }
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6 mt-4", children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-primary", children: "Matches" }), _jsxs(Tabs, { value: tab, onValueChange: setTab, className: "w-full", children: [_jsxs(TabsList, { className: "mb-4", children: [_jsx(TabsTrigger, { value: "recommended", children: "Recommended" }), _jsx(TabsTrigger, { value: "history", children: "Match History" })] }), _jsxs(TabsContent, { value: "recommended", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-4", children: [_jsx("h2", { className: "text-xl font-medium", children: "Recommended Profiles" }), _jsxs(Select, { value: selectedActivity, onValueChange: setSelectedActivity, children: [_jsx(SelectTrigger, { className: "w-full sm:w-[250px]", children: _jsx(SelectValue, { placeholder: "Select an activity" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Activities" }), userActivities.map(activity => (_jsx(SelectItem, { value: activity.id.toString(), children: activity.title }, activity.id)))] })] })] }), _jsx(MatchList, { activityId: selectedActivity === "all" ? undefined : selectedActivity })] }), _jsxs(TabsContent, { value: "history", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-4", children: [_jsx("h2", { className: "text-xl font-medium", children: "Match History" }), _jsxs(Select, { value: selectedActivity, onValueChange: setSelectedActivity, children: [_jsx(SelectTrigger, { className: "w-full sm:w-[250px]", children: _jsx(SelectValue, { placeholder: "Select an activity" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Activities" }), userActivities.map(activity => (_jsx(SelectItem, { value: activity.id.toString(), children: activity.title }, activity.id)))] })] })] }), _jsx(MatchList, { activityId: selectedActivity === "all" ? undefined : selectedActivity, historyMode: true })] })] })] }) }));
};
export default MatchesPage;

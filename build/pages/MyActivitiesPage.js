import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JoinedActivities from "@/components/profile/JoinedActivities";
import { useAuth } from "@/context/AuthContext";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import ActivityDetails from "../components/activities/ActivityDetails";
import MatchesList from "../components/match/ConnectionsList";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
const MyActivitiesPage = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activityIdParam = searchParams.get('activityId') || "";
    const [selectedActivityId, setSelectedActivityId] = useState(activityIdParam);
    const { activityId } = useParams();
    const navigate = useNavigate();
    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            toast.error("You must be logged in to access this page", {
                description: "You'll be redirected to the login page",
            });
            setTimeout(() => navigate("/login"), 1500);
        }
    }, [isAuthenticated, isLoading, navigate]);
    // If there's an activityId in the URL params, use it
    useEffect(() => {
        if (activityId) {
            setSelectedActivityId(activityId);
        }
    }, [activityId]);
    const handleBackToList = () => {
        setSelectedActivityId(null);
        setSearchParams({});
    };
    const handleSelectActivity = (id) => {
        setSelectedActivityId(id);
        setSearchParams({ activityId: id });
    };
    if (isLoading) {
        return (_jsx(PageLayout, { children: _jsx("div", { className: "space-y-6", children: _jsx("h1", { className: "text-3xl md:text-4xl font-bold text-primary", children: "Loading..." }) }) }));
    }
    return (_jsx(PageLayout, { children: _jsx("div", { className: "space-y-6", children: selectedActivityId ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center", children: [_jsxs(Button, { variant: "ghost", onClick: handleBackToList, className: "mr-2", children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back to All Activities"] }), _jsx("h1", { className: "text-2xl md:text-3xl font-bold text-primary", children: "Activity Details" })] }), _jsxs(Tabs, { defaultValue: "details", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full md:w-auto md:inline-flex grid-cols-2", children: [_jsx(TabsTrigger, { value: "details", children: "Activity Details" }), _jsx(TabsTrigger, { value: "matches", children: "Matches" })] }), _jsx(TabsContent, { value: "details", className: "mt-6", children: _jsx(ActivityDetails, { activityId: selectedActivityId }) }), _jsx(TabsContent, { value: "matches", className: "mt-6", children: _jsx(MatchesList, { activityId: selectedActivityId }) })] })] })) : (_jsxs(_Fragment, { children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-primary", children: "My Activities" }), _jsx(JoinedActivities, { onSelectActivity: handleSelectActivity })] })) }) }));
};
export default MyActivitiesPage;

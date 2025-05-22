import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import ActivityList from "@/components/activity-management/ActivityList";
import ParticipantList from "@/components/activity-management/ParticipantList";
import MatchRounds from "@/components/activity-management/MatchRounds";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
const ActivityManagement = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activityIdParam = searchParams.get('activityId');
    const [selectedActivityId, setSelectedActivityId] = useState(activityIdParam);
    const { isAuthenticated } = useAuth();
    const [activityTab, setActivityTab] = useState("upcoming");
    const handleCreateActivity = () => {
        navigate("/create-activity");
    };
    const handleBackToList = () => {
        setSelectedActivityId(null);
        setSearchParams({});
    };
    const handleSelectActivity = (id) => {
        setSelectedActivityId(id);
        setSearchParams({ activityId: id });
    };
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [selectedActivityId ? (_jsxs("div", { className: "flex items-center", children: [_jsxs(Button, { variant: "ghost", onClick: handleBackToList, className: "mr-2", children: [_jsx(ArrowLeft, { size: 16, className: "mr-2" }), "Back to All Activities"] }), _jsx("h1", { className: "text-2xl md:text-3xl font-bold text-primary", children: "Activity Details" })] })) : (_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-primary", children: "Organizer Portal" })), !selectedActivityId && (_jsxs(Button, { onClick: handleCreateActivity, className: "w-full md:w-auto", children: [_jsx(Plus, { size: 16, className: "mr-2" }), "Create Activity"] }))] }), selectedActivityId ? (_jsxs(Tabs, { defaultValue: "participants", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full md:w-auto md:inline-flex grid-cols-2", children: [_jsx(TabsTrigger, { value: "participants", children: "Participants" }), _jsx(TabsTrigger, { value: "matches", children: "Match Rounds" })] }), _jsx(TabsContent, { value: "participants", className: "mt-6", children: _jsx(ParticipantList, { activityId: selectedActivityId }) }), _jsx(TabsContent, { value: "matches", className: "mt-6", children: _jsx(MatchRounds, { activityId: selectedActivityId }) })] })) : (_jsxs(_Fragment, { children: [_jsx(Tabs, { defaultValue: activityTab, className: "w-full", onValueChange: v => setActivityTab(v), children: _jsxs(TabsList, { className: "w-full md:w-auto grid grid-cols-2 mb-4", children: [_jsx(TabsTrigger, { value: "upcoming", children: "Upcoming" }), _jsx(TabsTrigger, { value: "completed", children: "Completed" })] }) }), _jsx(ActivityList, { onSelectActivity: handleSelectActivity, statusFilter: activityTab })] }))] }) }));
};
export default ActivityManagement;

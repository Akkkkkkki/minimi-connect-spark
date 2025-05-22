import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PageLayout from "@/components/layout/PageLayout";
import QuestionnaireForm from "@/components/questionnaire/QuestionnaireForm";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
const ParticipantQuestionnairePage = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const { activityId } = useParams();
    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            toast.error("You must be logged in to access this page", {
                description: "You'll be redirected to the login page",
            });
            setTimeout(() => navigate("/login"), 1500);
        }
    }, [isAuthenticated, isLoading, navigate]);
    if (isLoading) {
        return (_jsx(PageLayout, { children: _jsx("div", { className: "space-y-6", children: _jsx("h1", { className: "text-3xl md:text-4xl font-bold text-primary", children: "Loading..." }) }) }));
    }
    if (!activityId) {
        return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-primary", children: "Missing Activity" }), _jsx("p", { children: "Could not find the requested activity." })] }) }));
    }
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-primary", children: "Activity Questionnaire" }), _jsx("p", { className: "text-gray-600 text-lg max-w-2xl", children: "Complete this questionnaire to help us find great matches for you at this event." }), _jsx(QuestionnaireForm, { activityId: activityId, isParticipant: true })] }) }));
};
export default ParticipantQuestionnairePage;

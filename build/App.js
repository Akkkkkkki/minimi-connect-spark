import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import AllActivitiesPage from "@/pages/ActivitiesPage";
import ActivityDetailsPage from "@/pages/ActivityDetailsPage";
import ProfileDashboard from "@/pages/ProfileDashboard";
import MyActivitiesPage from "@/pages/MyActivitiesPage";
import CreateActivity from "@/pages/CreateActivity";
import ActivityManagement from "@/pages/ActivityManagement";
import MatchHistoryPage from "@/pages/MatchHistoryPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import QuestionnaireBuilderPage from "./pages/QuestionnaireBuilderPage";
import ParticipantQuestionnairePage from "./pages/ParticipantQuestionnairePage";
import OnboardingPage from "@/pages/OnboardingPage";
import { useRequireProfileCompletion } from "@/hooks/useRequireProfileCompletion";
import { Suspense } from "react";
import EditActivity from "./pages/EditActivity";
import MatchesPage from "@/pages/MatchResults";
function RequireProfileCompletion({ children }) {
    const { profileChecked } = useRequireProfileCompletion();
    if (!profileChecked) {
        return _jsx("div", { className: "flex items-center justify-center min-h-screen", children: "Checking profile\u2026" });
    }
    return _jsx(_Fragment, { children: children });
}
function App() {
    return (_jsx(ThemeProvider, { defaultTheme: "light", storageKey: "vite-ui-theme", children: _jsxs(AuthProvider, { children: [_jsx(Router, { children: _jsx(Suspense, { fallback: _jsx("div", { className: "flex items-center justify-center min-h-screen", children: "Loading..." }), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignupPage, {}) }), _jsx(Route, { path: "/how-it-works", element: _jsx(HowItWorksPage, {}) }), _jsx(Route, { path: "/onboarding", element: _jsx(OnboardingPage, {}) }), _jsx(Route, { path: "/", element: _jsx(RequireProfileCompletion, { children: _jsx(Index, {}) }) }), _jsx(Route, { path: "/activities", element: _jsx(RequireProfileCompletion, { children: _jsx(AllActivitiesPage, {}) }) }), _jsx(Route, { path: "/activities/:activityId", element: _jsx(RequireProfileCompletion, { children: _jsx(ActivityDetailsPage, {}) }) }), _jsx(Route, { path: "/activities/:activityId/questionnaire", element: _jsx(RequireProfileCompletion, { children: _jsx(ParticipantQuestionnairePage, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(RequireProfileCompletion, { children: _jsx(ProfileDashboard, {}) }) }), _jsx(Route, { path: "/my-activities", element: _jsx(RequireProfileCompletion, { children: _jsx(MyActivitiesPage, {}) }) }), _jsx(Route, { path: "/create-activity", element: _jsx(RequireProfileCompletion, { children: _jsx(CreateActivity, {}) }) }), _jsx(Route, { path: "/edit-activity/:id", element: _jsx(EditActivity, {}) }), _jsx(Route, { path: "/activity-management", element: _jsx(RequireProfileCompletion, { children: _jsx(ActivityManagement, {}) }) }), _jsx(Route, { path: "/activity-management/:activityId/questionnaire", element: _jsx(RequireProfileCompletion, { children: _jsx(QuestionnaireBuilderPage, {}) }) }), _jsx(Route, { path: "/matches", element: _jsx(RequireProfileCompletion, { children: _jsx(MatchesPage, {}) }) }), _jsx(Route, { path: "/match-history", element: _jsx(RequireProfileCompletion, { children: _jsx(MatchHistoryPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }) }), _jsx(Toaster, {})] }) }));
}
export default App;

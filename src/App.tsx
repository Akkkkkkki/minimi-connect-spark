
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import ActivitiesPage from "@/pages/ActivitiesPage";
import ActivityDetailsPage from "@/pages/ActivityDetailsPage";
import ProfileDashboard from "@/pages/ProfileDashboard";
import MyActivitiesPage from "@/pages/MyActivitiesPage";
import CreateActivity from "@/pages/CreateActivity";
import ActivityManagement from "@/pages/ActivityManagement";
import MatchResults from "@/pages/MatchResults";
import MatchHistoryPage from "@/pages/MatchHistoryPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import QuestionnaireBuilderPage from "./pages/QuestionnaireBuilderPage";
import ParticipantQuestionnairePage from "./pages/ParticipantQuestionnairePage";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:activityId" element={<ActivityDetailsPage />} />
            <Route path="/activities/:activityId/questionnaire" element={<ParticipantQuestionnairePage />} />
            <Route path="/profile" element={<ProfileDashboard />} />
            <Route path="/my-activities" element={<MyActivitiesPage />} />
            <Route path="/create-activity" element={<CreateActivity />} />
            <Route path="/activity-management" element={<ActivityManagement />} />
            <Route path="/activity-management/:activityId/questionnaire" element={<QuestionnaireBuilderPage />} />
            <Route path="/matches" element={<MatchResults />} />
            <Route path="/match-history" element={<MatchHistoryPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

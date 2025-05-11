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
import MatchResults from "@/pages/MatchResults";
import MatchHistoryPage from "@/pages/MatchHistoryPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import QuestionnaireBuilderPage from "./pages/QuestionnaireBuilderPage";
import ParticipantQuestionnairePage from "./pages/ParticipantQuestionnairePage";
import OnboardingPage from "@/pages/OnboardingPage";
import { useRequireProfileCompletion } from "@/hooks/useRequireProfileCompletion";
import { Suspense } from "react";
import EditActivity from "./pages/EditActivity";

function RequireProfileCompletion({ children }: { children: React.ReactNode }) {
  const { profileChecked } = useRequireProfileCompletion();
  
  if (!profileChecked) {
    return <div className="flex items-center justify-center min-h-screen">Checking profile…</div>;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <Routes>
              {/* Public routes and onboarding that don't require profile check */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              
              {/* Protected routes that require profile check */}
              <Route path="/" element={
                <RequireProfileCompletion>
                  <Index />
                </RequireProfileCompletion>
              } />
              <Route path="/activities" element={
                <RequireProfileCompletion>
                  <AllActivitiesPage />
                </RequireProfileCompletion>
              } />
              <Route path="/activities/:activityId" element={
                <RequireProfileCompletion>
                  <ActivityDetailsPage />
                </RequireProfileCompletion>
              } />
              <Route path="/activities/:activityId/questionnaire" element={
                <RequireProfileCompletion>
                  <ParticipantQuestionnairePage />
                </RequireProfileCompletion>
              } />
              <Route path="/profile" element={
                <RequireProfileCompletion>
                  <ProfileDashboard />
                </RequireProfileCompletion>
              } />
              <Route path="/my-activities" element={
                <RequireProfileCompletion>
                  <MyActivitiesPage />
                </RequireProfileCompletion>
              } />
              <Route path="/create-activity" element={
                <RequireProfileCompletion>
                  <CreateActivity />
                </RequireProfileCompletion>
              } />
              <Route path="/edit-activity/:id" element={<EditActivity />} />
              <Route path="/activity-management" element={
                <RequireProfileCompletion>
                  <ActivityManagement />
                </RequireProfileCompletion>
              } />
              <Route path="/activity-management/:activityId/questionnaire" element={
                <RequireProfileCompletion>
                  <QuestionnaireBuilderPage />
                </RequireProfileCompletion>
              } />
              <Route path="/matches" element={
                <RequireProfileCompletion>
                  <MatchResults />
                </RequireProfileCompletion>
              } />
              <Route path="/match-history" element={
                <RequireProfileCompletion>
                  <MatchHistoryPage />
                </RequireProfileCompletion>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

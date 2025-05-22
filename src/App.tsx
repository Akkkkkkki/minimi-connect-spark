import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import AllEventsPage from "@/pages/EventsPage";
import EventDetailsPage from "@/pages/EventDetailsPage";
import ProfileDashboard from "@/pages/ProfileDashboard";
import MyEventsPage from "@/pages/MyEventsPage";
import CreateEvent from "@/pages/CreateEvent";
import EventManagement from "@/pages/EventManagement";
import MatchResults from "@/pages/MatchResults";
import MatchHistoryPage from "@/pages/MatchHistoryPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import QuestionnaireBuilderPage from "./pages/QuestionnaireBuilderPage";
import ParticipantQuestionnairePage from "./pages/ParticipantQuestionnairePage";
import OnboardingPage from "@/pages/OnboardingPage";
import { useRequireProfileCompletion } from "@/hooks/useRequireProfileCompletion";
import { Suspense } from "react";
import EditEvent from "./pages/EditEvent";
import MatchesPage from "@/pages/MatchResults";

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
              <Route path="/events" element={
                <RequireProfileCompletion>
                  <AllEventsPage />
                </RequireProfileCompletion>
              } />
              <Route path="/events/:eventId" element={
                <RequireProfileCompletion>
                  <EventDetailsPage />
                </RequireProfileCompletion>
              } />
              <Route path="/events/:eventId/questionnaire" element={
                <RequireProfileCompletion>
                  <ParticipantQuestionnairePage />
                </RequireProfileCompletion>
              } />
              <Route path="/profile" element={
                <RequireProfileCompletion>
                  <ProfileDashboard />
                </RequireProfileCompletion>
              } />
              <Route path="/my-events" element={
                <RequireProfileCompletion>
                  <MyEventsPage />
                </RequireProfileCompletion>
              } />
              <Route path="/create-event" element={
                <RequireProfileCompletion>
                  <CreateEvent />
                </RequireProfileCompletion>
              } />
              <Route path="/edit-event/:id" element={<EditEvent />} />
              <Route path="/event-management" element={
                <RequireProfileCompletion>
                  <EventManagement />
                </RequireProfileCompletion>
              } />
              <Route path="/event-management/:eventId/questionnaire" element={
                <RequireProfileCompletion>
                  <QuestionnaireBuilderPage />
                </RequireProfileCompletion>
              } />
              <Route path="/matches" element={
                <RequireProfileCompletion>
                  <MatchesPage />
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

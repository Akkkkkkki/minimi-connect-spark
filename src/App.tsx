
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth, RedirectIfAuthenticated } from "@/context/AuthContext";
import Index from "./pages/Index";
import ActivitiesPage from "./pages/ActivitiesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";
import ProfileDashboard from "./pages/ProfileDashboard";
import ActivityManagement from "./pages/ActivityManagement";
import MatchResults from "./pages/MatchResults";
import CreateActivity from "./pages/CreateActivity";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route 
              path="/login" 
              element={
                <RedirectIfAuthenticated>
                  <LoginPage />
                </RedirectIfAuthenticated>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <RedirectIfAuthenticated>
                  <SignupPage />
                </RedirectIfAuthenticated>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <RequireAuth>
                  <ProfileDashboard />
                </RequireAuth>
              } 
            />
            <Route 
              path="/activity-management" 
              element={
                <RequireAuth>
                  <ActivityManagement />
                </RequireAuth>
              } 
            />
            <Route 
              path="/matches" 
              element={
                <RequireAuth>
                  <MatchResults />
                </RequireAuth>
              } 
            />
            <Route 
              path="/create-activity" 
              element={
                <RequireAuth>
                  <CreateActivity />
                </RequireAuth>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import PageLayout from "@/components/layout/PageLayout";
import QuestionnaireForm from "@/components/questionnaire/QuestionnaireForm";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const ParticipantQuestionnairePage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();

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
    return (
      <PageLayout>
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Loading...</h1>
        </div>
      </PageLayout>
    );
  }

  if (!eventId) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Missing Event</h1>
          <p>Could not find the requested event.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Event Questionnaire</h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Complete this questionnaire to help us find great matches for you at this event.
        </p>
        
        <QuestionnaireForm eventId={eventId} isParticipant={true} />
      </div>
    </PageLayout>
  );
};

export default ParticipantQuestionnairePage;

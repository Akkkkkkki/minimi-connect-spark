
import PageLayout from "@/components/layout/PageLayout";
import QuestionnaireBuilder from "@/components/questionnaire/QuestionnaireBuilder";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const QuestionnaireBuilderPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
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

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Loading...</h1>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Questionnaire Builder</h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Create questions that will help match participants effectively. Well-designed questions lead to better matches.
        </p>
        
        <QuestionnaireBuilder />
      </div>
    </PageLayout>
  );
};

export default QuestionnaireBuilderPage;

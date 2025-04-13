import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Question, Questionnaire, ActivityParticipant } from "@/utils/supabaseTypes";

interface QuestionnaireFormProps {
  activityId: string;
  isParticipant?: boolean;
}

interface Answers {
  [questionId: string]: {
    answer: string | string[];
  };
}

const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({ activityId, isParticipant = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [activity, setActivity] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [existingParticipation, setExistingParticipation] = useState<ActivityParticipant | null>(null);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      setLoading(true);
      try {
        // Fetch activity information
        const { data: activityData, error: activityError } = await supabase
          .from("activities")
          .select("*")
          .eq("id", activityId)
          .single();

        if (activityError) throw activityError;
        setActivity(activityData);

        // Fetch questionnaire
        const { data: questionnaireData, error: questionnaireError } = await supabase
          .from("questionnaires")
          .select("*")
          .eq("activity_id", activityId)
          .single();

        if (questionnaireError && questionnaireError.code !== "PGRST116") {
          // PGRST116 is "no rows returned" - not an error if creating a new questionnaire
          throw questionnaireError;
        }

        if (questionnaireData) {
          // Parse questions JSON if it's stored as a string
          const questions = typeof questionnaireData.questions === 'string'
            ? JSON.parse(questionnaireData.questions)
            : questionnaireData.questions;

          setQuestionnaire({
            ...questionnaireData,
            questions: questions
          });
        }

        if (isParticipant && user) {
          // Check if user has already filled in the questionnaire
          const { data: participationData, error: participationError } = await supabase
            .from("activity_participants")
            .select("*")
            .eq("activity_id", activityId)
            .eq("profile_id", user.id)
            .single();

          if (participationError && participationError.code !== "PGRST116") {
            throw participationError;
          }

          if (participationData) {
            setExistingParticipation(participationData);
            setAnswers(participationData.answers || {});
          }
        }
      } catch (error) {
        console.error("Error fetching questionnaire:", error);
        toast.error("Failed to load questionnaire");
      } finally {
        setLoading(false);
      }
    };

    if (activityId) {
      fetchQuestionnaire();
    }
  }, [activityId, user, isParticipant]);

  const handleTextAnswer = (questionId: string, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: { answer: value }
    });
  };

  const handleSingleChoiceAnswer = (questionId: string, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: { answer: value }
    });
  };

  const handleMultipleChoiceAnswer = (questionId: string, value: string, checked: boolean) => {
    const currentAnswers = answers[questionId]?.answer || [];
    let newAnswers: string[] = [];
    
    if (Array.isArray(currentAnswers)) {
      newAnswers = checked
        ? [...currentAnswers, value]
        : currentAnswers.filter(option => option !== value);
    } else {
      newAnswers = checked ? [value] : [];
    }

    setAnswers({
      ...answers,
      [questionId]: { answer: newAnswers }
    });
  };

  const isOptionSelected = (questionId: string, option: string): boolean => {
    const answer = answers[questionId]?.answer;
    if (Array.isArray(answer)) {
      return answer.includes(option);
    }
    return answer === option;
  };

  const validateAnswers = (): boolean => {
    if (!questionnaire) return false;

    let isValid = true;
    const requiredQuestions = questionnaire.questions.filter(q => q.required);

    for (const question of requiredQuestions) {
      const answer = answers[question.id]?.answer;
      
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        toast.error(`Please answer the required question: ${question.text}`);
        isValid = false;
        break;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit the questionnaire");
      return;
    }

    if (!validateAnswers()) return;

    setSaving(true);
    try {
      if (isParticipant) {
        // Check if the user is already a participant
        if (existingParticipation) {
          // Update existing participation
          await supabase
            .from("activity_participants")
            .update({
              answers,
              status: "completed",
              updated_at: new Date().toISOString()
            })
            .eq("id", existingParticipation.id);
        } else {
          // Create new participation
          await supabase
            .from("activity_participants")
            .insert({
              activity_id: activityId,
              profile_id: user.id,
              answers,
              status: "completed"
            });
        }
        
        toast.success("Your answers have been submitted");
        navigate(`/my-activities`);
      } else {
        // Organizer is creating or updating a questionnaire
        if (questionnaire?.id) {
          // Update existing questionnaire
          await supabase
            .from("questionnaires")
            .update({
              questions: questionnaire.questions
            })
            .eq("id", questionnaire.id);
        } else {
          // Create new questionnaire
          await supabase
            .from("questionnaires")
            .insert({
              activity_id: activityId,
              title: "Activity Questionnaire",
              description: "Please complete this questionnaire to help us match you with others.",
              questions: []
            });
        }
        
        toast.success("Questionnaire has been saved");
        navigate(`/activity-management`);
      }
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      toast.error("Failed to submit questionnaire");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isParticipant) {
      navigate(`/activities/${activityId}`);
    } else {
      navigate(`/activity-management`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="pt-4">
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!questionnaire && isParticipant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Questionnaire Available</CardTitle>
          <CardDescription>
            The organizer hasn't created a questionnaire for this activity yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBack}>Back to Activity</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>
            {activity?.title} - {isParticipant ? "Questionnaire" : "Create Questionnaire"}
          </CardTitle>
        </div>
        <CardDescription>
          {isParticipant
            ? "Please complete this questionnaire to help us match you with others."
            : "Create questions to help match participants effectively."}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isParticipant && (
            <div className="space-y-2">
              <Label htmlFor="title">Questionnaire Title</Label>
              <Input
                id="title"
                value={questionnaire?.title || "Activity Questionnaire"}
                onChange={(e) => setQuestionnaire(prev => prev ? {...prev, title: e.target.value} : null)}
                className="w-full"
              />
            </div>
          )}
          
          {!isParticipant && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={questionnaire?.description || "Please complete this questionnaire to help us match you with others."}
                onChange={(e) => setQuestionnaire(prev => prev ? {...prev, description: e.target.value} : null)}
                className="w-full"
              />
            </div>
          )}

          {isParticipant && questionnaire?.questions && questionnaire.questions.length > 0 && (
            <div className="space-y-6">
              {questionnaire.questions.map((question) => (
                <div key={question.id} className="space-y-3 border-b pb-6">
                  <div className="flex items-center">
                    <Label className="text-base font-medium">
                      {question.text}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  </div>
                  
                  {question.type === "text" && (
                    <Textarea
                      placeholder="Your answer"
                      value={(answers[question.id]?.answer as string) || ""}
                      onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                      className="w-full"
                    />
                  )}
                  
                  {question.type === "multiple_choice" && question.options && (
                    <div className="space-y-3">
                      {question.options.length <= 4 ? (
                        <RadioGroup
                          value={(answers[question.id]?.answer as string) || ""}
                          onValueChange={(value) => handleSingleChoiceAnswer(question.id, value)}
                          className="flex flex-col space-y-2"
                        >
                          {question.options.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                              <Label htmlFor={`${question.id}-${idx}`}>{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <div className="space-y-2">
                          {question.options.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${question.id}-${idx}`}
                                checked={isOptionSelected(question.id, option)}
                                onCheckedChange={(checked) => 
                                  handleMultipleChoiceAnswer(question.id, option, checked === true)
                                }
                              />
                              <Label htmlFor={`${question.id}-${idx}`}>{option}</Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isParticipant && questionnaire?.questions && questionnaire.questions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No questions have been added to this questionnaire yet.</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isParticipant ? "Submit Answers" : "Save Questionnaire"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuestionnaireForm;

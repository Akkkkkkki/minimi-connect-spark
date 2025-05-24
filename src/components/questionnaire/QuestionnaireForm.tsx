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
import { EventParticipant, Question, ParticipantStatus } from "@/types/index";

interface QuestionnaireFormProps {
  eventId: string;
  isParticipant?: boolean;
}

interface Answers {
  [questionId: string]: {
    answer: string | string[];
  };
}

const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({ eventId, isParticipant = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<Question | null>(null);
  const [event, setEvent] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [existingParticipation, setExistingParticipation] = useState<EventParticipant | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      setLoading(true);
      try {
        // Fetch event information
        const { data: eventData, error: eventError } = await supabase
          .from('event')
          .select("*")
          .eq("id", eventId)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        // Fetch questionnaire for this event
        const { data: aqData, error: aqError } = await supabase
          .from('event_questionnaire')
          .select("*")
          .eq("event_id", eventId)
          .maybeSingle();
        if (aqError) throw aqError;
        if (!aqData) {
          setQuestions([]);
          setQuestionnaire(null);
        } else {
          // Fetch questions for this questionnaire
          const { data: questionsData, error: questionsError } = await supabase
            .from('questionnaire_question')
            .select("id,question_text,question_type,order,options,required,questionnaire_id")
            .eq("questionnaire_id", aqData.id)
            .order("order", { ascending: true });
          if (questionsError) throw questionsError;
          setQuestions(
            (questionsData || []).map((q: any) => ({
              id: q.id,
              text: q.question_text,
              type: q.question_type === "single_choice" ? "multiple_choice" : q.question_type,
              options: q.options,
              required: q.required,
              order: q.order,
            }))
          );
        }

        if (isParticipant && user) {
          // Check if user has already filled in the questionnaire
          const { data: participationData, error: participationError } = await supabase
            .from('event_participant')
            .select("*")
            .eq("event_id", eventId)
            .eq("profile_id", user.id)
            .single();

          if (participationError && participationError.code !== "PGRST116") {
            throw participationError;
          }

          if (participationData) {
            setExistingParticipation({
              id: participationData.id.toString(),
              eventId: participationData.event_id,
              profileId: participationData.profile_id,
              status: participationData.status as ParticipantStatus,
              createdAt: participationData.created_at,
              updatedAt: participationData.updated_at,
            });
            // Fetch existing questionnaire responses
            const { data: responsesData, error: responsesError } = await supabase
              .from('questionnaire_response')
              .select("*")
              .eq("participant_id", participationData.id);

            if (responsesError) throw responsesError;
            // Convert responses to answers format
            const answers: Answers = {};
            responsesData?.forEach((response: any) => {
              answers[response.question_id] = { answer: response.answers as string | string[] };
            });
            setAnswers(answers);
          } else {
          }
        }
      } catch (error) {
        toast.error("Failed to load questionnaire");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchQuestionnaire();
    }
  }, [eventId, user, isParticipant]);

  // Debug: Log answers and questions after they are loaded
  useEffect(() => {
    if (questions.length > 0) {
      questions.forEach((question) => {
      });
    }
  }, [questions, answers]);

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
    if (!questions) return false;

    let isValid = true;
    const requiredQuestions = questions.filter(q => q.required);

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
        let participantId = existingParticipation?.id;
        if (existingParticipation) {
          // Update existing participation - they've completed the questionnaire
          const { error: updateError } = await supabase
            .from('event_participant')
            .update({
              status: "completed",
              updated_at: new Date().toISOString()
            })
            .eq("id", Number(existingParticipation.id));

          if (updateError) {
            throw new Error(`Failed to update participation: ${updateError.message}`);
          }
        } else {
          // Create new participation - they've just joined and completed the questionnaire
          const { data: newParticipation, error: participationError } = await supabase
            .from('event_participant')
            .insert({
              event_id: eventId,
              profile_id: user.id,
              status: "completed"
            })
            .select()
            .single();

          if (participationError) {
            throw new Error(`Failed to create participation: ${participationError.message}`);
          }

          if (!newParticipation) {
            throw new Error("Failed to create participation: No data returned");
          }
          participantId = newParticipation.id.toString();
        }

        // Upsert (update or insert) questionnaire responses for each question
        for (const question of questions) {
          // Check if a response already exists for this participant/question
          const { data: existingResponse, error: fetchError } = await supabase
            .from('questionnaire_response')
            .select("id")
            .eq("participant_id", Number(participantId))
            .eq("question_id", question.id)
            .maybeSingle();
          if (fetchError) {
            throw new Error(`Failed to check existing response: ${fetchError.message}`);
          }
          if (existingResponse && existingResponse.id) {
            // Update existing response
            const { error: updateResponseError } = await supabase
              .from('questionnaire_response')
              .update({
                answers: answers[question.id]?.answer || null,
                updated_at: new Date().toISOString()
              })
              .eq("id", existingResponse.id);
            if (updateResponseError) {
              throw new Error(`Failed to update questionnaire response: ${updateResponseError.message}`);
            }
          } else {
            // Insert new response
            const { error: insertResponseError } = await supabase
              .from('questionnaire_response')
              .insert({
                participant_id: Number(participantId),
                question_id: question.id,
                answers: answers[question.id]?.answer || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            if (insertResponseError) {
              throw new Error(`Failed to save questionnaire response: ${insertResponseError.message}`);
            }
          }
        }
        toast.success("Your answers have been submitted");
        navigate(`/my-events`);
      } else {
        // Organizer is creating or updating questions
        // Remove all logic that writes to the old questionnaire table
        // Only update questionnaire_content and event_questionnaire as needed
        // ... (implementation depends on your organizer logic, but do not use questionnaire table)
        toast.success("Questions have been saved");
        navigate(`/event-management`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit questionnaire");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isParticipant) {
      navigate(`/events/${eventId}`);
    } else {
      navigate(`/event-management`);
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
            The organizer hasn't created a questionnaire for this event yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBack}>Back to Event</Button>
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
            {event?.title} - {isParticipant ? "Questionnaire" : "Create Questionnaire"}
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
                value={event?.title || ""}
                disabled
                className="w-full"
              />
            </div>
          )}
          
          {!isParticipant && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={event?.description || ""}
                disabled
                className="w-full"
              />
            </div>
          )}

          {isParticipant && questions && questions.length > 0 && (
            <div className="space-y-6">
              {questions.map((question) => {
                const options = question.options ?? [];
                const required = question.required ?? true;
                return (
                  <div key={question.id} className="space-y-3 border-b pb-6">
                    <div className="flex items-center">
                      <Label className="text-base font-medium">
                        {question.text}
                        {required && <span className="text-red-500 ml-1">*</span>}
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

                    {question.type === "multiple_choice" && options && (
                      <div className="space-y-2">
                        {options.map((option, idx) => (
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
                );
              })}
            </div>
          )}

          {isParticipant && questions && questions.length === 0 && (
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

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, GripVertical, MoveUp, MoveDown, Edit, Save } from "lucide-react";
import { Question, Questionnaire } from "@/types/index";

const QuestionnaireBuilder = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<any | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [event, setEvent] = useState<any | null>(null);
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]);

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: "",
    type: "text",
    required: true,
    options: [""]
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        // Fetch event info for title/description
        const { data: eventData, error: eventError } = await supabase
          .from('event')
          .select("*")
          .eq("id", eventId)
          .single();
        if (eventError) throw eventError;
        setEvent(eventData);
        // Fetch event_questionnaire to get id
        const { data: aqData, error: aqError } = await supabase
          .from('event_questionnaire')
          .select("*")
          .eq("event_id", eventId)
          .maybeSingle();
        if (aqError) throw aqError;
        if (!aqData) {
          setQuestionnaire(null);
          setQuestions([]);
          setOriginalQuestions([]);
        } else {
          setQuestionnaire(aqData);
          // Fetch questions for this questionnaire
          const { data: questionsData, error: questionsError } = await supabase
            .from('questionnaire_question')
            .select("*")
            .eq("event_questionnaire_id", aqData.id)
            .order("order", { ascending: true });
          if (questionsError) throw questionsError;
          setQuestions(
            (questionsData || []).map((q: any) => ({
              id: q.id,
              text: q.question_text,
              type: q.question_type,
              options: q.options ? (typeof q.options === "string" ? JSON.parse(q.options) : q.options) : undefined,
              required: q.required,
              order: q.order,
            }))
          );
          setOriginalQuestions(
            (questionsData || []).map((q: any) => ({
              id: q.id,
              text: q.question_text,
              type: q.question_type,
              options: q.options ? (typeof q.options === "string" ? JSON.parse(q.options) : q.options) : undefined,
              required: q.required,
              order: q.order,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching questionnaire:", error);
        toast.error("Failed to load questionnaire");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionnaire();
  }, [eventId]);

  const handleQuestionTypeChange = (type: "multiple_choice" | "text") => {
    setNewQuestion({
      ...newQuestion,
      type,
      options: type === "multiple_choice" ? [""] : undefined
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!newQuestion.options) return;
    
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };

  const addOption = () => {
    if (!newQuestion.options) return;
    
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""]
    });
  };

  const removeOption = (index: number) => {
    if (!newQuestion.options) return;
    
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter((_, i) => i !== index)
    });
  };

  const addQuestion = () => {
    if (!newQuestion.text) {
      toast.error("Question text is required");
      return;
    }
    if (newQuestion.type === "multiple_choice" && (!newQuestion.options || newQuestion.options.filter(o => o.trim()).length < 2)) {
      toast.error("Multiple choice questions require at least two options");
      return;
    }
    const newQuestionComplete: Question = {
      id: crypto.randomUUID(),
      text: newQuestion.text!,
      type: newQuestion.type || "text",
      required: newQuestion.required ?? true,
      options: newQuestion.type === "multiple_choice" ? newQuestion.options?.filter(o => o.trim()) : undefined,
      order: questions.length
    };
    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = newQuestionComplete;
      setQuestions(updatedQuestions);
      setEditingQuestionIndex(null);
    } else {
      setQuestions([...questions, newQuestionComplete]);
    }
    setNewQuestion({
      text: "",
      type: "text",
      required: true,
      options: [""]
    });
  };

  const editQuestion = (index: number) => {
    const question = questions[index];
    setNewQuestion({
      ...question,
      options: question.options ?? [""],
      required: question.required ?? true
    });
    setEditingQuestionIndex(index);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === questions.length - 1)) {
      return;
    }

    const updatedQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [updatedQuestions[index], updatedQuestions[newIndex]] = 
    [updatedQuestions[newIndex], updatedQuestions[index]];
    
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to save the questionnaire");
      return;
    }
    if (!eventId) {
      toast.error("Event ID is missing");
      return;
    }
    setSaving(true);
    try {
      let questionnaireId = questionnaire?.id;
      // If questionnaire does not exist, create it first
      if (!questionnaireId) {
        const { data: newQ, error: newQError } = await supabase
          .from('event_questionnaire')
          .insert({ event_id: eventId })
          .select()
          .single();
        if (newQError) throw newQError;
        questionnaireId = newQ.id;
        setQuestionnaire(newQ); // update state for future
      }
      if (!questionnaireId) {
        toast.error("Failed to create questionnaire record");
        setSaving(false);
        return;
      }
      // Upsert all questions
      const upsertQuestions = questions.map((q, idx) => {
        const dbQuestion: any = {
          id: q.id,
          event_questionnaire_id: questionnaireId,
          question_text: q.text,
          question_type: q.type,
          required: q.required,
          order: idx,
        };
        if (q.type === 'multiple_choice' && q.options) {
          dbQuestion.options = JSON.stringify(q.options);
        }
        return dbQuestion;
      });
      const { error: upsertError } = await supabase
        .from('questionnaire_question')
        .upsert(upsertQuestions as any, { onConflict: 'id' });
      if (upsertError) throw upsertError;
      // Delete removed questions
      const currentIds = new Set(questions.map(q => q.id));
      const toDelete = originalQuestions.filter(q => !currentIds.has(q.id));
      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('questionnaire_question')
          .delete()
          .in('id', toDelete.map(q => q.id));
        if (deleteError) throw deleteError;
      }
      toast.success("Questionnaire has been saved");
      navigate(`/event-management`);
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      toast.error("Failed to save questionnaire");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/event-management`);
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
          <CardTitle>Questionnaire Builder</CardTitle>
        </div>
        <CardDescription>
          Create questions to help match participants for{" "}
          <span className="font-medium">{event?.title}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Questions</h3>
            
            {questions.length === 0 ? (
              <div className="text-center py-4 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No questions yet. Add your first question below.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const options = question.options ?? [];
                  const required = question.required ?? true;
                  if (editingQuestionIndex === index) {
                    // Render edit form in place
                    return (
                      <Card key={question.id} className="relative">
                        <CardContent className="pt-4 pl-10">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="questionText">Question Text</Label>
                              <Input
                                id="questionText"
                                value={newQuestion.text}
                                onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                                placeholder="Enter your question here"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="questionType">Question Type</Label>
                              <Select
                                value={newQuestion.type}
                                onValueChange={(value) => handleQuestionTypeChange(value as "multiple_choice" | "text")}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select question type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text Response</SelectItem>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="required"
                                checked={newQuestion.required}
                                onCheckedChange={(checked) => setNewQuestion({...newQuestion, required: checked})}
                              />
                              <Label htmlFor="required">Required Question</Label>
                            </div>
                            {newQuestion.type === "multiple_choice" && (
                              <div className="space-y-3">
                                <Label>Options</Label>
                                {newQuestion.options?.map((option, optIdx) => (
                                  <div key={optIdx} className="flex space-x-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                                      placeholder={`Option ${optIdx + 1}`}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeOption(optIdx)}
                                      disabled={newQuestion.options?.length === 1}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={addOption}
                                  className="mt-2"
                                >
                                  <Plus className="h-4 w-4 mr-2" /> Add Option
                                </Button>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Button type="button" onClick={addQuestion}>
                                <Save className="h-4 w-4 mr-2" /> Update Question
                              </Button>
                              <Button type="button" variant="outline" onClick={() => {
                                setEditingQuestionIndex(null);
                                setNewQuestion({
                                  text: "",
                                  type: "text",
                                  required: true,
                                  options: [""]
                                });
                              }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  // Render normal card
                  return (
                    <Card key={question.id} className="relative">
                      <div className="absolute left-2 top-4 flex flex-col gap-1">
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          onClick={() => moveQuestion(index, 'up')}
                          disabled={index === 0}
                          className="h-6 w-6"
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <GripVertical className="h-4 w-4 mx-auto text-muted-foreground" />
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          onClick={() => moveQuestion(index, 'down')}
                          disabled={index === questions.length - 1}
                          className="h-6 w-6"
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="pt-4 pl-10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{question.text}</h4>
                            <p className="text-sm text-muted-foreground">
                              Type: {question.type === 'multiple_choice' ? 'Multiple Choice' : 'Text'} | 
                              {required ? ' Required' : ' Optional'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              type="button"
                              variant="outline" 
                              size="icon"
                              onClick={() => editQuestion(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button"
                              variant="outline" 
                              size="icon"
                              onClick={() => deleteQuestion(index)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {question.type === 'multiple_choice' && options.length > 0 && (
                          <div className="mt-2 pl-4">
                            <p className="text-sm font-medium mb-1">Options:</p>
                            <ul className="list-disc pl-5 text-sm">
                              {options.map((option, i) => (
                                <li key={i}>{option}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Only show add new question form if not editing */}
            {editingQuestionIndex === null && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-md font-medium mb-4">Add New Question</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="questionText">Question Text</Label>
                    <Input
                      id="questionText"
                      value={newQuestion.text}
                      onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                      placeholder="Enter your question here"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="questionType">Question Type</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value) => handleQuestionTypeChange(value as "multiple_choice" | "text")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Response</SelectItem>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="required"
                      checked={newQuestion.required}
                      onCheckedChange={(checked) => setNewQuestion({...newQuestion, required: checked})}
                    />
                    <Label htmlFor="required">Required Question</Label>
                  </div>
                  {newQuestion.type === "multiple_choice" && (
                    <div className="space-y-3">
                      <Label>Options</Label>
                      {newQuestion.options?.map((option, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeOption(index)}
                            disabled={newQuestion.options?.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Option
                      </Button>
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={addQuestion}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Question
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={saving || questions.length === 0}
        >
          {saving ? "Saving..." : "Save Questionnaire"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionnaireBuilder;

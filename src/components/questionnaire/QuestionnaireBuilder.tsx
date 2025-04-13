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
import { Question, Questionnaire } from "@/utils/supabaseTypes";

const QuestionnaireBuilder = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>({
    id: "",
    activity_id: activityId || "",
    title: "Activity Questionnaire",
    description: "Please complete this questionnaire to help us match you with others.",
    questions: []
  });
  const [activity, setActivity] = useState<any | null>(null);
  
  // New question form state
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    text: "",
    type: "text",
    required: true,
    options: [""]
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!activityId) return;
      
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

        // Fetch questionnaire if it exists
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
            questions: questions || []
          });
        }
      } catch (error) {
        console.error("Error fetching questionnaire:", error);
        toast.error("Failed to load questionnaire");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [activityId]);

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
      id: `q${Date.now()}`,
      text: newQuestion.text,
      type: newQuestion.type || "text",
      required: newQuestion.required ?? true,
      options: newQuestion.type === "multiple_choice" 
        ? newQuestion.options?.filter(o => o.trim()) 
        : undefined
    };

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questionnaire.questions];
      updatedQuestions[editingQuestionIndex] = newQuestionComplete;
      
      setQuestionnaire({
        ...questionnaire,
        questions: updatedQuestions
      });
      setEditingQuestionIndex(null);
    } else {
      // Add new question
      setQuestionnaire({
        ...questionnaire,
        questions: [...questionnaire.questions, newQuestionComplete]
      });
    }

    // Reset form
    setNewQuestion({
      text: "",
      type: "text",
      required: true,
      options: [""]
    });
  };

  const editQuestion = (index: number) => {
    const question = questionnaire.questions[index];
    setNewQuestion({
      ...question,
      options: question.options || [""]
    });
    setEditingQuestionIndex(index);
  };

  const deleteQuestion = (index: number) => {
    setQuestionnaire({
      ...questionnaire,
      questions: questionnaire.questions.filter((_, i) => i !== index)
    });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === questionnaire.questions.length - 1)) {
      return;
    }

    const updatedQuestions = [...questionnaire.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [updatedQuestions[index], updatedQuestions[newIndex]] = 
    [updatedQuestions[newIndex], updatedQuestions[index]];
    
    setQuestionnaire({
      ...questionnaire,
      questions: updatedQuestions
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to save the questionnaire");
      return;
    }

    if (!activityId) {
      toast.error("Activity ID is missing");
      return;
    }

    setSaving(true);
    try {
      if (questionnaire.id) {
        // Update existing questionnaire
        const { error } = await supabase
          .from("questionnaires")
          .update({
            title: questionnaire.title,
            description: questionnaire.description,
            questions: questionnaire.questions
          })
          .eq("id", questionnaire.id);

        if (error) throw error;
      } else {
        // Create new questionnaire
        const { error } = await supabase
          .from("questionnaires")
          .insert({
            activity_id: activityId,
            title: questionnaire.title,
            description: questionnaire.description,
            questions: questionnaire.questions
          });

        if (error) throw error;
      }
      
      toast.success("Questionnaire has been saved");
      navigate(`/activity-management`);
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      toast.error("Failed to save questionnaire");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/activity-management`);
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
          <span className="font-medium">{activity?.title}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Questionnaire Title</Label>
              <Input
                id="title"
                value={questionnaire.title}
                onChange={(e) => setQuestionnaire({...questionnaire, title: e.target.value})}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={questionnaire.description || ""}
                onChange={(e) => setQuestionnaire({...questionnaire, description: e.target.value})}
                className="w-full"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Questions</h3>
            
            {questionnaire.questions.length === 0 ? (
              <div className="text-center py-4 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No questions yet. Add your first question below.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questionnaire.questions.map((question, index) => (
                  <Card key={question.id} className="relative">
                    <div className="absolute left-2 top-4 flex flex-col gap-1">
                      <Button 
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
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === questionnaire.questions.length - 1}
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
                            {question.required ? ' Required' : ' Optional'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => editQuestion(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => deleteQuestion(index)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="mt-2 pl-4">
                          <p className="text-sm font-medium mb-1">Options:</p>
                          <ul className="list-disc pl-5 text-sm">
                            {question.options.map((option, i) => (
                              <li key={i}>{option}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-6 border-t pt-6">
              <h3 className="text-md font-medium mb-4">
                {editingQuestionIndex !== null ? "Edit Question" : "Add New Question"}
              </h3>
              
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
                  {editingQuestionIndex !== null ? (
                    <><Save className="h-4 w-4 mr-2" /> Update Question</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" /> Add Question</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={saving || questionnaire.questions.length === 0}
        >
          {saving ? "Saving..." : "Save Questionnaire"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionnaireBuilder;

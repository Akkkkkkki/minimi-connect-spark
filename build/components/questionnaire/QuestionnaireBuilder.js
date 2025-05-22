import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, GripVertical, MoveUp, MoveDown, Edit, Save } from "lucide-react";
const QuestionnaireBuilder = () => {
    const { activityId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [questionnaire, setQuestionnaire] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [activity, setActivity] = useState(null);
    const [originalQuestions, setOriginalQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        question_text: "",
        question_type: "text",
        required: true,
        options: [""]
    });
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
    useEffect(() => {
        const fetchQuestionnaire = async () => {
            if (!activityId)
                return;
            setLoading(true);
            try {
                // Fetch activity info for title/description
                const { data: activityData, error: activityError } = await supabase
                    .from('activity')
                    .select("*")
                    .eq("id", activityId)
                    .single();
                if (activityError)
                    throw activityError;
                setActivity(activityData);
                // Fetch activity_questionnaire to get id
                const { data: aqData, error: aqError } = await supabase
                    .from('activity_questionnaire')
                    .select("*")
                    .eq("activity_id", activityId)
                    .maybeSingle();
                if (aqError)
                    throw aqError;
                if (!aqData) {
                    setQuestionnaire(null);
                    setQuestions([]);
                    setOriginalQuestions([]);
                }
                else {
                    setQuestionnaire(aqData);
                    // Fetch questions for this questionnaire
                    const { data: questionsData, error: questionsError } = await supabase
                        .from('questionnaire_question')
                        .select("*")
                        .eq("questionnaire_id", aqData.id)
                        .order("order", { ascending: true });
                    if (questionsError)
                        throw questionsError;
                    setQuestions(questionsData || []);
                    setOriginalQuestions(questionsData || []);
                }
            }
            catch (error) {
                console.error("Error fetching questionnaire:", error);
                toast.error("Failed to load questionnaire");
            }
            finally {
                setLoading(false);
            }
        };
        fetchQuestionnaire();
    }, [activityId]);
    const handleQuestionTypeChange = (type) => {
        setNewQuestion({
            ...newQuestion,
            question_type: type,
            options: type === "multiple_choice" ? [""] : undefined
        });
    };
    const handleOptionChange = (index, value) => {
        if (!newQuestion.options)
            return;
        const updatedOptions = [...newQuestion.options];
        updatedOptions[index] = value;
        setNewQuestion({
            ...newQuestion,
            options: updatedOptions
        });
    };
    const addOption = () => {
        if (!newQuestion.options)
            return;
        setNewQuestion({
            ...newQuestion,
            options: [...newQuestion.options, ""]
        });
    };
    const removeOption = (index) => {
        if (!newQuestion.options)
            return;
        setNewQuestion({
            ...newQuestion,
            options: newQuestion.options.filter((_, i) => i !== index)
        });
    };
    const addQuestion = () => {
        if (!newQuestion.question_text) {
            toast.error("Question text is required");
            return;
        }
        if (newQuestion.question_type === "multiple_choice" && (!newQuestion.options || newQuestion.options.filter(o => o.trim()).length < 2)) {
            toast.error("Multiple choice questions require at least two options");
            return;
        }
        const newQuestionComplete = {
            id: crypto.randomUUID(),
            questionnaire_id: questionnaire?.id || '',
            question_text: newQuestion.question_text,
            question_type: newQuestion.question_type || "text",
            required: newQuestion.required ?? true,
            options: newQuestion.question_type === "multiple_choice" ? newQuestion.options?.filter(o => o.trim()) : undefined,
            order: questions.length
        };
        if (editingQuestionIndex !== null) {
            const updatedQuestions = [...questions];
            updatedQuestions[editingQuestionIndex] = newQuestionComplete;
            setQuestions(updatedQuestions);
            setEditingQuestionIndex(null);
        }
        else {
            setQuestions([...questions, newQuestionComplete]);
        }
        setNewQuestion({
            question_text: "",
            question_type: "text",
            required: true,
            options: [""]
        });
    };
    const editQuestion = (index) => {
        const question = questions[index];
        setNewQuestion({
            ...question,
            options: question.options ?? [""],
            required: question.required ?? true
        });
        setEditingQuestionIndex(index);
    };
    const deleteQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };
    const moveQuestion = (index, direction) => {
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
    const handleSubmit = async (e) => {
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
            // Upsert all questions
            const upsertQuestions = questions.map((q, idx) => {
                const base = {
                    ...q,
                    order: idx,
                    questionnaire_id: questionnaire.id,
                };
                if (q.question_type === 'multiple_choice' && q.options) {
                    return { ...base, options: JSON.stringify(q.options) };
                }
                // Remove options field for non-multiple_choice
                const { options, ...rest } = base;
                return rest;
            });
            const { error: upsertError } = await supabase
                .from('questionnaire_question')
                .upsert(upsertQuestions, { onConflict: 'id' });
            if (upsertError)
                throw upsertError;
            // Delete removed questions
            const currentIds = new Set(questions.map(q => q.id));
            const toDelete = originalQuestions.filter(q => !currentIds.has(q.id));
            if (toDelete.length > 0) {
                const { error: deleteError } = await supabase
                    .from('questionnaire_question')
                    .delete()
                    .in('id', toDelete.map(q => q.id));
                if (deleteError)
                    throw deleteError;
            }
            toast.success("Questionnaire has been saved");
            navigate(`/activity-management`);
        }
        catch (error) {
            console.error("Error saving questionnaire:", error);
            toast.error("Failed to save questionnaire");
        }
        finally {
            setSaving(false);
        }
    };
    const handleBack = () => {
        navigate(`/activity-management`);
    };
    if (loading) {
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(Skeleton, { className: "h-8 w-2/3" }), _jsx(Skeleton, { className: "h-4 w-1/2 mt-2" })] }), _jsx(CardContent, { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-full" }), _jsx(Skeleton, { className: "h-10 w-full" })] }, i))) })] }));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: handleBack, className: "mr-2", children: _jsx(ArrowLeft, { className: "h-4 w-4" }) }), _jsx(CardTitle, { children: "Questionnaire Builder" })] }), _jsxs(CardDescription, { children: ["Create questions to help match participants for", " ", _jsx("span", { className: "font-medium", children: activity?.title })] })] }), _jsx(CardContent, { children: _jsx("form", { onSubmit: handleSubmit, className: "space-y-6", children: _jsxs("div", { className: "border-t pt-6", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "Questions" }), questions.length === 0 ? (_jsx("div", { className: "text-center py-4 border border-dashed rounded-lg", children: _jsx("p", { className: "text-muted-foreground", children: "No questions yet. Add your first question below." }) })) : (_jsx("div", { className: "space-y-4", children: questions.map((question, index) => {
                                    const options = question.options ?? [];
                                    const required = question.required ?? true;
                                    if (editingQuestionIndex === index) {
                                        // Render edit form in place
                                        return (_jsx(Card, { className: "relative", children: _jsx(CardContent, { className: "pt-4 pl-10", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "questionText", children: "Question Text" }), _jsx(Input, { id: "questionText", value: newQuestion.question_text, onChange: (e) => setNewQuestion({ ...newQuestion, question_text: e.target.value }), placeholder: "Enter your question here" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "questionType", children: "Question Type" }), _jsxs(Select, { value: newQuestion.question_type, onValueChange: (value) => handleQuestionTypeChange(value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select question type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "text", children: "Text Response" }), _jsx(SelectItem, { value: "multiple_choice", children: "Multiple Choice" })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "required", checked: newQuestion.required, onCheckedChange: (checked) => setNewQuestion({ ...newQuestion, required: checked }) }), _jsx(Label, { htmlFor: "required", children: "Required Question" })] }), newQuestion.question_type === "multiple_choice" && (_jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: "Options" }), newQuestion.options?.map((option, optIdx) => (_jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { value: option, onChange: (e) => handleOptionChange(optIdx, e.target.value), placeholder: `Option ${optIdx + 1}` }), _jsx(Button, { type: "button", variant: "outline", size: "icon", onClick: () => removeOption(optIdx), disabled: newQuestion.options?.length === 1, children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, optIdx))), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addOption, className: "mt-2", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Add Option"] })] })), _jsxs("div", { className: "flex gap-2 mt-2", children: [_jsxs(Button, { type: "button", onClick: addQuestion, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), " Update Question"] }), _jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                                                        setEditingQuestionIndex(null);
                                                                        setNewQuestion({
                                                                            question_text: "",
                                                                            question_type: "text",
                                                                            required: true,
                                                                            options: [""]
                                                                        });
                                                                    }, children: "Cancel" })] })] }) }) }, question.id));
                                    }
                                    // Render normal card
                                    return (_jsxs(Card, { className: "relative", children: [_jsxs("div", { className: "absolute left-2 top-4 flex flex-col gap-1", children: [_jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => moveQuestion(index, 'up'), disabled: index === 0, className: "h-6 w-6", children: _jsx(MoveUp, { className: "h-4 w-4" }) }), _jsx(GripVertical, { className: "h-4 w-4 mx-auto text-muted-foreground" }), _jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => moveQuestion(index, 'down'), disabled: index === questions.length - 1, className: "h-6 w-6", children: _jsx(MoveDown, { className: "h-4 w-4" }) })] }), _jsxs(CardContent, { className: "pt-4 pl-10", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: question.question_text }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Type: ", question.question_type === 'multiple_choice' ? 'Multiple Choice' : 'Text', " |", required ? ' Required' : ' Optional'] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { type: "button", variant: "outline", size: "icon", onClick: () => editQuestion(index), children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { type: "button", variant: "outline", size: "icon", onClick: () => deleteQuestion(index), className: "text-red-500", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }), question.question_type === 'multiple_choice' && options.length > 0 && (_jsxs("div", { className: "mt-2 pl-4", children: [_jsx("p", { className: "text-sm font-medium mb-1", children: "Options:" }), _jsx("ul", { className: "list-disc pl-5 text-sm", children: options.map((option, i) => (_jsx("li", { children: option }, i))) })] }))] })] }, question.id));
                                }) })), editingQuestionIndex === null && (_jsxs("div", { className: "mt-6 border-t pt-6", children: [_jsx("h3", { className: "text-md font-medium mb-4", children: "Add New Question" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "questionText", children: "Question Text" }), _jsx(Input, { id: "questionText", value: newQuestion.question_text, onChange: (e) => setNewQuestion({ ...newQuestion, question_text: e.target.value }), placeholder: "Enter your question here" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "questionType", children: "Question Type" }), _jsxs(Select, { value: newQuestion.question_type, onValueChange: (value) => handleQuestionTypeChange(value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select question type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "text", children: "Text Response" }), _jsx(SelectItem, { value: "multiple_choice", children: "Multiple Choice" })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "required", checked: newQuestion.required, onCheckedChange: (checked) => setNewQuestion({ ...newQuestion, required: checked }) }), _jsx(Label, { htmlFor: "required", children: "Required Question" })] }), newQuestion.question_type === "multiple_choice" && (_jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: "Options" }), newQuestion.options?.map((option, index) => (_jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { value: option, onChange: (e) => handleOptionChange(index, e.target.value), placeholder: `Option ${index + 1}` }), _jsx(Button, { type: "button", variant: "outline", size: "icon", onClick: () => removeOption(index), disabled: newQuestion.options?.length === 1, children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, index))), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addOption, className: "mt-2", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Add Option"] })] })), _jsxs(Button, { type: "button", onClick: addQuestion, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Add Question"] })] })] }))] }) }) }), _jsx(CardFooter, { className: "flex justify-end", children: _jsx(Button, { onClick: handleSubmit, disabled: saving || questions.length === 0, children: saving ? "Saving..." : "Save Questionnaire" }) })] }));
};
export default QuestionnaireBuilder;

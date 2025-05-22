import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
const QuestionnaireForm = ({ activityId, isParticipant = true }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [questionnaire, setQuestionnaire] = useState(null);
    const [activity, setActivity] = useState(null);
    const [answers, setAnswers] = useState({});
    const [existingParticipation, setExistingParticipation] = useState(null);
    const [questions, setQuestions] = useState([]);
    useEffect(() => {
        const fetchQuestionnaire = async () => {
            setLoading(true);
            try {
                // Fetch activity information
                const { data: activityData, error: activityError } = await supabase
                    .from('activity')
                    .select("*")
                    .eq("id", activityId)
                    .single();
                if (activityError)
                    throw activityError;
                setActivity(activityData);
                // Fetch questionnaire for this activity
                const { data: aqData, error: aqError } = await supabase
                    .from('activity_questionnaire')
                    .select("*")
                    .eq("activity_id", activityId)
                    .maybeSingle();
                if (aqError)
                    throw aqError;
                if (!aqData) {
                    setQuestions([]);
                    setQuestionnaire(null);
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
                }
                if (isParticipant && user) {
                    // Check if user has already filled in the questionnaire
                    const { data: participationData, error: participationError } = await supabase
                        .from('activity_participant')
                        .select("*")
                        .eq("activity_id", activityId)
                        .eq("profile_id", user.id)
                        .single();
                    if (participationError && participationError.code !== "PGRST116") {
                        throw participationError;
                    }
                    if (participationData) {
                        setExistingParticipation(participationData);
                        // Fetch existing questionnaire responses
                        const { data: responsesData, error: responsesError } = await supabase
                            .from('questionnaire_response')
                            .select("*")
                            .eq("participant_id", participationData.id);
                        if (responsesError)
                            throw responsesError;
                        // Convert responses to answers format
                        const answers = {};
                        responsesData?.forEach(response => {
                            answers[response.question_id] = { answer: response.answers };
                        });
                        setAnswers(answers);
                    }
                    else {
                    }
                }
            }
            catch (error) {
                toast.error("Failed to load questionnaire");
            }
            finally {
                setLoading(false);
            }
        };
        if (activityId) {
            fetchQuestionnaire();
        }
    }, [activityId, user, isParticipant]);
    // Debug: Log answers and questions after they are loaded
    useEffect(() => {
        if (questions.length > 0) {
            questions.forEach((question) => {
            });
        }
    }, [questions, answers]);
    const handleTextAnswer = (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: { answer: value }
        });
    };
    const handleSingleChoiceAnswer = (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: { answer: value }
        });
    };
    const handleMultipleChoiceAnswer = (questionId, value, checked) => {
        const currentAnswers = answers[questionId]?.answer || [];
        let newAnswers = [];
        if (Array.isArray(currentAnswers)) {
            newAnswers = checked
                ? [...currentAnswers, value]
                : currentAnswers.filter(option => option !== value);
        }
        else {
            newAnswers = checked ? [value] : [];
        }
        setAnswers({
            ...answers,
            [questionId]: { answer: newAnswers }
        });
    };
    const isOptionSelected = (questionId, option) => {
        const answer = answers[questionId]?.answer;
        if (Array.isArray(answer)) {
            return answer.includes(option);
        }
        return answer === option;
    };
    const validateAnswers = () => {
        if (!questions)
            return false;
        let isValid = true;
        const requiredQuestions = questions.filter(q => q.required);
        for (const question of requiredQuestions) {
            const answer = answers[question.id]?.answer;
            if (!answer || (Array.isArray(answer) && answer.length === 0)) {
                toast.error(`Please answer the required question: ${question.question_text}`);
                isValid = false;
                break;
            }
        }
        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in to submit the questionnaire");
            return;
        }
        if (!validateAnswers())
            return;
        setSaving(true);
        try {
            if (isParticipant) {
                // Check if the user is already a participant
                let participantId = existingParticipation?.id;
                if (existingParticipation) {
                    // Update existing participation - they've completed the questionnaire
                    const { error: updateError } = await supabase
                        .from('activity_participant')
                        .update({
                        status: "completed",
                        updated_at: new Date().toISOString()
                    })
                        .eq("id", existingParticipation.id);
                    if (updateError) {
                        throw new Error(`Failed to update participation: ${updateError.message}`);
                    }
                }
                else {
                    // Create new participation - they've just joined and completed the questionnaire
                    const { data: newParticipation, error: participationError } = await supabase
                        .from('activity_participant')
                        .insert({
                        activity_id: activityId,
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
                    participantId = newParticipation.id;
                }
                // Upsert (update or insert) questionnaire responses for each question
                for (const question of questions) {
                    // Check if a response already exists for this participant/question
                    const { data: existingResponse, error: fetchError } = await supabase
                        .from('questionnaire_response')
                        .select("id")
                        .eq("participant_id", participantId)
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
                    }
                    else {
                        // Insert new response
                        const { error: insertResponseError } = await supabase
                            .from('questionnaire_response')
                            .insert({
                            participant_id: participantId,
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
                navigate(`/my-activities`);
            }
            else {
                // Organizer is creating or updating questions
                // Remove all logic that writes to the old questionnaire table
                // Only update questionnaire_content and activity_questionnaire as needed
                // ... (implementation depends on your organizer logic, but do not use questionnaire table)
                toast.success("Questions have been saved");
                navigate(`/activity-management`);
            }
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit questionnaire");
        }
        finally {
            setSaving(false);
        }
    };
    const handleBack = () => {
        if (isParticipant) {
            navigate(`/activities/${activityId}`);
        }
        else {
            navigate(`/activity-management`);
        }
    };
    if (loading) {
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(Skeleton, { className: "h-8 w-2/3" }), _jsx(Skeleton, { className: "h-4 w-1/2 mt-2" })] }), _jsxs(CardContent, { className: "space-y-4", children: [[1, 2, 3].map((i) => (_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-full" }), _jsx(Skeleton, { className: "h-10 w-full" })] }, i))), _jsx("div", { className: "pt-4", children: _jsx(Skeleton, { className: "h-10 w-32" }) })] })] }));
    }
    if (!questionnaire && isParticipant) {
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "No Questionnaire Available" }), _jsx(CardDescription, { children: "The organizer hasn't created a questionnaire for this activity yet." })] }), _jsx(CardContent, { children: _jsx(Button, { onClick: handleBack, children: "Back to Activity" }) })] }));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: handleBack, className: "mr-2", children: _jsx(ArrowLeft, { className: "h-4 w-4" }) }), _jsxs(CardTitle, { children: [activity?.title, " - ", isParticipant ? "Questionnaire" : "Create Questionnaire"] })] }), _jsx(CardDescription, { children: isParticipant
                            ? "Please complete this questionnaire to help us match you with others."
                            : "Create questions to help match participants effectively." })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [!isParticipant && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "title", children: "Questionnaire Title" }), _jsx(Input, { id: "title", value: activity?.title || "", disabled: true, className: "w-full" })] })), !isParticipant && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", value: activity?.description || "", disabled: true, className: "w-full" })] })), isParticipant && questions && questions.length > 0 && (_jsx("div", { className: "space-y-6", children: questions.map((question) => {
                                const options = question.options ?? [];
                                const required = question.required ?? true;
                                return (_jsxs("div", { className: "space-y-3 border-b pb-6", children: [_jsx("div", { className: "flex items-center", children: _jsxs(Label, { className: "text-base font-medium", children: [question.question_text, required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] }) }), question.question_type === "text" && (_jsx(Textarea, { placeholder: "Your answer", value: answers[question.id]?.answer || "", onChange: (e) => handleTextAnswer(question.id, e.target.value), className: "w-full" })), question.question_type === "single_choice" && options && (_jsx(RadioGroup, { value: answers[question.id]?.answer || "", onValueChange: (value) => handleSingleChoiceAnswer(question.id, value), className: "flex flex-col space-y-2", children: options.map((option, idx) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(RadioGroupItem, { value: option, id: `${question.id}-${idx}` }), _jsx(Label, { htmlFor: `${question.id}-${idx}`, children: option })] }, idx))) })), question.question_type === "multiple_choice" && options && (_jsx("div", { className: "space-y-2", children: options.map((option, idx) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: `${question.id}-${idx}`, checked: isOptionSelected(question.id, option), onCheckedChange: (checked) => handleMultipleChoiceAnswer(question.id, option, checked === true) }), _jsx(Label, { htmlFor: `${question.id}-${idx}`, children: option })] }, idx))) }))] }, question.id));
                            }) })), isParticipant && questions && questions.length === 0 && (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-muted-foreground", children: "No questions have been added to this questionnaire yet." }) })), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { type: "submit", disabled: saving, children: saving ? "Saving..." : isParticipant ? "Submit Answers" : "Save Questionnaire" }) })] }) })] }));
};
export default QuestionnaireForm;

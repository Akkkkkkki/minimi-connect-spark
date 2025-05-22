import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
const MatchList = ({ activityId, historyMode }) => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedbackType, setFeedbackType] = useState(null);
    const [currentMatchId, setCurrentMatchId] = useState(null);
    useEffect(() => {
        const fetchMatches = async () => {
            if (!user)
                return;
            try {
                setLoading(true);
                // Get rounds for the activity if specified
                let roundIds = [];
                if (activityId && activityId !== 'all') {
                    const { data: rounds, error: roundsError } = await supabase
                        .from('match_round')
                        .select('id')
                        .eq('activity_id', parseInt(activityId));
                    if (roundsError)
                        throw roundsError;
                    if (rounds && rounds.length > 0) {
                        roundIds = rounds.map((r) => r.id);
                    }
                }
                // Query for matches
                let matchesQuery = supabase
                    .from('match')
                    .select(`
            id,
            match_score,
            match_reason_1,
            match_reason_2,
            icebreaker_1,
            icebreaker_2,
            created_at,
            round_id,
            profile_id_1,
            profile_id_2
          `)
                    .or(`profile_id_1.eq.${user.id},profile_id_2.eq.${user.id}`);
                if (roundIds.length > 0) {
                    matchesQuery = matchesQuery.in('round_id', roundIds);
                }
                const { data: matchesData, error: matchesError } = await matchesQuery;
                if (matchesError)
                    throw matchesError;
                if (!matchesData || matchesData.length === 0) {
                    setMatches([]);
                    setLoading(false);
                    return;
                }
                // Fetch all feedback data
                const { data: feedbackData, error: feedbackError } = await supabase
                    .from('match_feedback')
                    .select('match_id, profile_id, is_positive')
                    .in('match_id', matchesData.map(m => m.id));
                if (feedbackError)
                    throw feedbackError;
                // Get all profile IDs to fetch
                const profileIds = new Set();
                matchesData.forEach(match => {
                    if (match.profile_id_1 !== user.id)
                        profileIds.add(match.profile_id_1);
                    if (match.profile_id_2 !== user.id)
                        profileIds.add(match.profile_id_2);
                });
                // Fetch profiles
                const { data: profiles, error: profilesError } = await supabase
                    .from('profile')
                    .select('id, first_name, last_name, avatar_url')
                    .in('id', Array.from(profileIds));
                if (profilesError)
                    throw profilesError;
                // Get activity information from rounds
                const roundToActivityMap = new Map();
                for (const roundId of new Set(matchesData.map(m => m.round_id))) {
                    const { data: round } = await supabase
                        .from('match_round')
                        .select('activity_id, name, activity:activity_id (id, title)')
                        .eq('id', roundId)
                        .single();
                    if (round && round.activity && Array.isArray(round.activity)) {
                        // Cast the activity data to the correct type
                        const activityData = {
                            id: typeof round.activity[0].id === 'number' ? round.activity[0].id : Number(round.activity[0].id),
                            title: String(round.activity[0].title || '')
                        };
                        roundToActivityMap.set(roundId, activityData);
                    }
                }
                // Create a map for quick profile lookup
                const profileMap = new Map();
                profiles?.forEach(profile => profileMap.set(profile.id, profile));
                // Process matches
                const processedMatches = [];
                for (const match of matchesData) {
                    // Find the other user's profile ID
                    const otherUserId = match.profile_id_1 === user.id ? match.profile_id_2 : match.profile_id_1;
                    const otherUserProfile = profileMap.get(otherUserId);
                    if (!otherUserProfile)
                        continue; // Skip if profile not found
                    // Get the activity info
                    const activity = roundToActivityMap.get(match.round_id);
                    if (!activity)
                        continue; // Skip if activity not found
                    // Check feedback status
                    const myFeedback = feedbackData?.find(f => f.match_id === match.id && f.profile_id === user.id);
                    const otherUserFeedback = feedbackData?.find(f => f.match_id === match.id && f.profile_id === otherUserId);
                    // Determine feedback states
                    const hasGivenFeedback = !!myFeedback;
                    const hasPositiveFeedback = myFeedback ? myFeedback.is_positive : false;
                    let otherUserFeedbackStatus = 'none';
                    if (otherUserFeedback) {
                        otherUserFeedbackStatus = otherUserFeedback.is_positive ? 'positive' : 'negative';
                    }
                    // For the Matches tab, only show mutual positive matches
                    const shouldShow = !activityId || otherUserFeedbackStatus === 'positive' && hasPositiveFeedback;
                    if (activityId && !shouldShow)
                        continue; // Skip non-mutual matches in activity view
                    // Determine which reason/icebreaker to show
                    let matchReason = '';
                    let icebreaker = '';
                    if (match.profile_id_1 === user.id) {
                        matchReason = match.match_reason_1 || 'You seem to be compatible based on your answers.';
                        icebreaker = match.icebreaker_1 || 'What brings you to this activity?';
                    }
                    else {
                        matchReason = match.match_reason_2 || 'You seem to be compatible based on your answers.';
                        icebreaker = match.icebreaker_2 || 'What brings you to this activity?';
                    }
                    const processedMatch = {
                        id: match.id.toString(),
                        name: `${otherUserProfile.first_name || ''} ${otherUserProfile.last_name || ''}`.trim() || 'User',
                        activityName: activity.title || 'Unnamed Activity',
                        activityId: activity.id.toString(),
                        matchDate: new Date(match.created_at).toISOString().split('T')[0],
                        matchScore: Math.round(Number(match.match_score) * 100), // Convert decimal to percentage
                        matchReason,
                        icebreaker,
                        photoUrl: otherUserProfile.avatar_url,
                        hasGivenFeedback,
                        hasPositiveFeedback,
                        otherUserFeedback: otherUserFeedbackStatus,
                        shouldShow
                    };
                    processedMatches.push(processedMatch);
                }
                // Sort matches by score (highest first)
                processedMatches.sort((a, b) => b.matchScore - a.matchScore);
                setMatches(processedMatches);
            }
            catch (error) {
                console.error("MatchList Error:", error);
                toast.error("Failed to load matches");
            }
            finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, [user, activityId]);
    const handlePositiveFeedback = async (matchId) => {
        try {
            if (!user)
                return;
            // Check if feedback already exists
            const { data: existingFeedback } = await supabase
                .from('match_feedback')
                .select('id')
                .eq('match_id', parseInt(matchId))
                .eq('profile_id', user.id)
                .maybeSingle();
            if (existingFeedback) {
                // Update existing feedback
                const { error } = await supabase
                    .from('match_feedback')
                    .update({ is_positive: true })
                    .eq('id', existingFeedback.id);
                if (error)
                    throw error;
            }
            else {
                // Insert new feedback
                const { error } = await supabase
                    .from('match_feedback')
                    .insert({
                    match_id: parseInt(matchId),
                    profile_id: user.id,
                    is_positive: true,
                });
                if (error)
                    throw error;
            }
            // Update local state
            setMatches(matches.map(match => {
                if (match.id === matchId) {
                    const updatedMatch = {
                        ...match,
                        hasGivenFeedback: true,
                        hasPositiveFeedback: true
                    };
                    // Check if this is now a mutual positive match
                    if (match.otherUserFeedback === 'positive') {
                        updatedMatch.shouldShow = true;
                        toast.success("It's a match! You both expressed interest.");
                    }
                    else {
                        toast.success("Positive feedback submitted!");
                    }
                    return updatedMatch;
                }
                return match;
            }));
        }
        catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error("Failed to submit feedback");
        }
    };
    const handleNegativeFeedback = async (matchId, reason) => {
        try {
            if (!user)
                return;
            // Check if feedback already exists
            const { data: existingFeedback } = await supabase
                .from('match_feedback')
                .select('id')
                .eq('match_id', parseInt(matchId))
                .eq('profile_id', user.id)
                .maybeSingle();
            if (existingFeedback) {
                // Update existing feedback
                const { error } = await supabase
                    .from('match_feedback')
                    .update({
                    is_positive: false,
                    reason: reason
                })
                    .eq('id', existingFeedback.id);
                if (error)
                    throw error;
            }
            else {
                // Insert new feedback
                const { error } = await supabase
                    .from('match_feedback')
                    .insert({
                    match_id: parseInt(matchId),
                    profile_id: user.id,
                    is_positive: false,
                    reason: reason
                });
                if (error)
                    throw error;
            }
            // Update local state - move this to the bottom of the list
            setMatches(prevMatches => {
                const updatedMatches = prevMatches.map(match => {
                    if (match.id === matchId) {
                        // Mark as not a fit
                        return {
                            ...match,
                            hasGivenFeedback: true,
                            hasPositiveFeedback: false
                        };
                    }
                    return match;
                });
                // Sort to move negative feedback matches to the bottom
                return updatedMatches.sort((a, b) => {
                    if (a.hasGivenFeedback && !a.hasPositiveFeedback &&
                        !(b.hasGivenFeedback && !b.hasPositiveFeedback)) {
                        return 1; // a goes to the bottom
                    }
                    if (!(a.hasGivenFeedback && !a.hasPositiveFeedback) &&
                        b.hasGivenFeedback && !b.hasPositiveFeedback) {
                        return -1; // b goes to the bottom
                    }
                    return b.matchScore - a.matchScore; // Otherwise sort by score
                });
            });
            toast.success("Feedback submitted, thanks for helping us improve!");
            // Reset the dialog state
            setFeedbackType(null);
            setCurrentMatchId(null);
        }
        catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error("Failed to submit feedback");
        }
    };
    const handleOpenFeedback = (matchId, type) => {
        setCurrentMatchId(matchId);
        setFeedbackType(type);
    };
    // Get matches to display based on context
    let displayMatches = matches;
    if (historyMode) {
        displayMatches = matches.filter(m => m.hasPositiveFeedback && m.otherUserFeedback === 'positive');
    }
    else if (activityId) {
        displayMatches = matches.filter(m => m.shouldShow);
    }
    if (loading) {
        return (_jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [_jsx(Skeleton, { className: "w-20 h-20 md:w-24 md:h-24 rounded-full" }), _jsxs("div", { className: "flex-1 space-y-3", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between", children: [_jsx(Skeleton, { className: "h-6 w-40" }), _jsx(Skeleton, { className: "h-4 w-32" })] }), _jsx(Skeleton, { className: "h-4 w-60" }), _jsx(Skeleton, { className: "h-16 w-full" }), _jsx(Skeleton, { className: "h-10 w-full" })] })] }) }) }, i))) }));
    }
    if (displayMatches.length === 0) {
        return (_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6 text-center py-12", children: [_jsx("p", { className: "text-muted-foreground", children: activityId && activityId !== 'all'
                            ? "No mutual matches found for this activity."
                            : "You don't have any matches yet." }), _jsx("p", { className: "mt-2", children: activityId && activityId !== 'all'
                            ? "Try selecting a different activity or check back later."
                            : "Join some activities to start matching with others!" }), (!activityId || activityId === 'all') && (_jsx(Button, { className: "mt-4", asChild: true, children: _jsx("a", { href: "/activities", children: "Browse Activities" }) }))] }) }));
    }
    return (_jsx(_Fragment, { children: _jsx("div", { className: "space-y-4", children: displayMatches.map((match) => {
                const isRejected = match.hasGivenFeedback && !match.hasPositiveFeedback;
                return (_jsx(Card, { className: `overflow-hidden ${isRejected ? "opacity-60" : ""}`, children: _jsxs(CardContent, { className: "p-0", children: [_jsx("div", { className: "p-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("img", { src: match.photoUrl || "https://i.pravatar.cc/150?img=32", alt: match.name, className: "w-20 h-20 md:w-24 md:h-24 rounded-full object-cover" }) }), _jsxs("div", { className: "flex-1 space-y-3", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center gap-2 justify-between", children: [_jsx("h3", { className: "text-xl font-semibold", children: match.name }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Matched on ", new Date(match.matchDate).toLocaleDateString()] })] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Activity: ", match.activityName] }), _jsx("div", { className: "bg-muted/50 p-3 rounded-md my-2", children: _jsx("p", { className: "text-sm", children: match.matchReason }) }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-accent-foreground bg-accent/50 p-2 rounded-md", children: [_jsx(MessageCircle, { size: 16 }), _jsx("span", { className: "italic", children: match.icebreaker })] })] })] }) }), _jsxs("div", { className: "border-t bg-muted/30 p-4 flex justify-between items-center", children: [_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Match score:" }), " ", match.matchScore, "%"] }), _jsx("div", { children: match.hasGivenFeedback ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Your feedback:" }), match.hasPositiveFeedback ? (_jsxs("span", { className: "flex items-center gap-1 text-green-600", children: [_jsx(ThumbsUp, { size: 16 }), "Good match"] })) : (_jsxs("span", { className: "flex items-center gap-1 text-red-600", children: [_jsx(ThumbsDown, { size: 16 }), "Not a fit"] }))] })) : (_jsxs("div", { className: "flex gap-2", children: [_jsxs(Dialog, { open: feedbackType === "negative" && currentMatchId === match.id, onOpenChange: (open) => {
                                                        if (!open) {
                                                            setFeedbackType(null);
                                                            setCurrentMatchId(null);
                                                        }
                                                    }, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { size: "sm", variant: "outline", className: "gap-1", onClick: () => handleOpenFeedback(match.id, "negative"), children: [_jsx(ThumbsDown, { size: 16 }), _jsx("span", { className: "hidden md:inline", children: "Not a fit" })] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Feedback for match with ", match.name] }), _jsx(DialogDescription, { children: "We're sorry this wasn't a good match. Please let us know why so we can improve." })] }), _jsx(NegativeFeedbackForm, { onSubmit: (reason) => handleNegativeFeedback(match.id, reason) })] })] }), _jsxs(Button, { size: "sm", variant: "default", className: "gap-1", onClick: () => handlePositiveFeedback(match.id), children: [_jsx(ThumbsUp, { size: 16 }), _jsx("span", { className: "hidden md:inline", children: "Good match" })] })] })) })] })] }) }, match.id));
            }) }) }));
};
const NegativeFeedbackForm = ({ onSubmit }) => {
    const [reason, setReason] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(reason);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "reason", children: "What wasn't a good fit? (optional)" }), _jsx(Textarea, { id: "reason", placeholder: "e.g., Different interests, location too far, etc.", value: reason, onChange: (e) => setReason(e.target.value) })] }), _jsxs(DialogFooter, { children: [_jsx(DialogClose, { asChild: true, children: _jsx(Button, { type: "button", variant: "outline", children: "Cancel" }) }), _jsx(Button, { type: "submit", children: "Submit Feedback" })] })] }));
};
export default MatchList;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
const DEFAULT_AVATAR = "https://i.pravatar.cc/150?img=32";
function getValidAvatarUrl(avatar) {
    if (!avatar || typeof avatar !== "string" || avatar.trim() === "")
        return DEFAULT_AVATAR;
    if (/^https?:\/\//.test(avatar))
        return avatar;
    return `https://uiswjpjgxsrnfxerzbrw.supabase.co/storage/v1/object/public/user/profile/${avatar}`;
}
const MatchesList = ({ activityId }) => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchMatches = async () => {
            if (!user)
                return;
            try {
                setLoading(true);
                let query = supabase
                    .from('match')
                    .select(`
            id,
            match_score,
            match_reason_1,
            match_reason_2,
            icebreaker_1,
            icebreaker_2,
            profile_id_1,
            profile_id_2,
            profile:profile_id_2 (id, first_name, last_name, avatar_url),
            match_feedback (
              id
            )
          `)
                    .eq('profile_id_1', user.id);
                if (activityId && activityId !== 'all') {
                    // First get the round ids for the activity
                    const { data: rounds, error: roundsError } = await supabase
                        .from('match_round')
                        .select('id')
                        .eq('activity_id', parseInt(activityId));
                    if (roundsError)
                        throw roundsError;
                    if (rounds && rounds.length > 0) {
                        const roundIds = rounds.map((r) => r.id);
                        query = query.in('round_id', roundIds);
                    }
                }
                // Execute the query to get matches
                const { data, error } = await query;
                if (error)
                    throw error;
                // If we have matches, fetch the profile data separately (avoids RLS issues)
                const profileIds = data?.map(match => match.profile_id_2) || [];
                let profileData = {};
                if (profileIds.length > 0) {
                    const { data: profiles, error: profileError } = await supabase
                        .from('profile')
                        .select('id, first_name, last_name, avatar_url')
                        .in('id', profileIds);
                    if (profileError) {
                        console.error("Error fetching profiles:", profileError);
                    }
                    else if (profiles) {
                        // Create a lookup object for easy access
                        profileData = profiles.reduce((acc, profile) => {
                            acc[profile.id] = profile;
                            return acc;
                        }, {});
                    }
                }
                const processedMatches = [];
                if (data) {
                    for (const match of data) {
                        const profile = profileData[match.profile_id_2] || match.profile;
                        if (profile) {
                            processedMatches.push({
                                id: match.id.toString(),
                                name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User',
                                avatar: profile.avatar_url || undefined,
                                matchReason: match.match_reason_1 || 'You seem to be compatible based on your answers.',
                                matchScore: match.match_score,
                                conversationStarter: match.icebreaker_1 || 'What brings you to this activity?',
                                hasResponded: match.match_feedback && match.match_feedback.length > 0
                            });
                        }
                    }
                }
                setMatches(processedMatches);
            }
            catch (error) {
                // Log detailed error information for debugging
                console.error("ConnectionsList Error:", {
                    error,
                    user: user?.id,
                    activityId,
                    // Log the raw query for debugging
                    query: `match table with profile_id_1=${user?.id} ${activityId && activityId !== 'all' ?
                        `and round_id in [rounds for activity ${activityId}]` : ''}`
                });
                // Add informative error for the user
                if (error.code === "PGRST116") {
                    toast.error("Permission denied: You don't have access to this data");
                }
                else if (error.code === "42P01") {
                    toast.error("Table not found: Database configuration issue");
                }
                else {
                    toast.error(`Failed to load connections: ${error.message || "Unknown error"}`);
                }
                setLoading(false);
            }
            finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, [user, activityId]);
    if (loading) {
        return (_jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsx(Card, { children: _jsxs(CardContent, { className: "p-4 flex items-center gap-4", children: [_jsx(Skeleton, { className: "h-12 w-12 rounded-full" }), _jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(Skeleton, { className: "h-4 w-32" }), _jsx(Skeleton, { className: "h-3 w-full" })] })] }) }, i))) }));
    }
    if (matches.length === 0) {
        return (_jsx(Card, { children: _jsx(CardContent, { className: "py-10 text-center", children: _jsx("p", { className: "text-muted-foreground", children: "No matches found for this activity yet." }) }) }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "These are the people you matched with during this activity." }), matches.map((match) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Avatar, { className: "h-12 w-12", children: [_jsx(AvatarImage, { src: getValidAvatarUrl(match.avatar), alt: match.name }), _jsx(AvatarFallback, { children: match.name.charAt(0) })] }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: match.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: match.matchReason })] }), _jsxs(Badge, { variant: "outline", className: "ml-2", children: [Math.round(match.matchScore * 100), "% Match"] })] }), _jsx("div", { className: "mt-3 p-3 bg-muted rounded-md text-sm italic", children: _jsxs("p", { className: "text-muted-foreground", children: [_jsx("span", { className: "font-medium text-foreground", children: "Conversation starter:" }), " ", match.conversationStarter] }) }), _jsx("div", { className: "mt-3 flex justify-end", children: _jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "h-4 w-4" }), "Message"] }) })] })] }) }) }, match.id)))] }));
};
export default MatchesList;

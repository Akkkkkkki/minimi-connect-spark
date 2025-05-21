import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface MatchListProps {
  activityId?: string;
  historyMode?: boolean;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface ActivityData {
  title: string;
  id: string | number;
}

interface RoundData {
  activity: ActivityData;
}

interface MatchData {
  id: number;
  match_score: number;
  match_reason_1: string | null;
  match_reason_2: string | null;
  icebreaker_1: string | null;
  icebreaker_2: string | null;
  created_at: string;
  round: RoundData;
  profile: Profile;
}

interface ProcessedMatch {
  id: string;
  name: string;
  activityName: string;
  activityId: string;
  matchDate: string;
  matchScore: number;
  matchReason: string;
  icebreaker: string;
  photoUrl: string | null;
  hasGivenFeedback: boolean;
  hasPositiveFeedback: boolean;
  otherUserFeedback: 'positive' | 'negative' | 'none';
  shouldShow: boolean;
}

const MatchList = ({ activityId, historyMode }: MatchListProps) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<ProcessedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackType, setFeedbackType] = useState<"positive" | "negative" | null>(null);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get rounds for the activity if specified
        let roundIds: number[] = [];
        
        if (activityId && activityId !== 'all') {
          const { data: rounds, error: roundsError } = await supabase
            .from('match_round')
            .select('id')
            .eq('activity_id', parseInt(activityId));
            
          if (roundsError) throw roundsError;
          
          if (rounds && rounds.length > 0) {
            roundIds = rounds.map((r: any) => r.id);
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
        
        if (matchesError) throw matchesError;
        
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
          
        if (feedbackError) throw feedbackError;
        
        // Get all profile IDs to fetch
        const profileIds = new Set<string>();
        matchesData.forEach(match => {
          if (match.profile_id_1 !== user.id) profileIds.add(match.profile_id_1);
          if (match.profile_id_2 !== user.id) profileIds.add(match.profile_id_2);
        });
        
        // Fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profile')
          .select('id, first_name, last_name, avatar_url')
          .in('id', Array.from(profileIds));
          
        if (profilesError) throw profilesError;
        
        // Get activity information from rounds
        const roundToActivityMap = new Map<number, { id: number; title: string }>();
        for (const roundId of new Set(matchesData.map(m => m.round_id))) {
          const { data: round } = await supabase
            .from('match_round')
            .select('activity_id, name, activity:activity_id (id, title)')
            .eq('id', roundId)
            .single();
            
          if (round && round.activity && Array.isArray(round.activity)) {
            // Cast the activity data to the correct type
            const activityData: { id: number; title: string } = {
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
        const processedMatches: ProcessedMatch[] = [];
        
        for (const match of matchesData) {
          // Find the other user's profile ID
          const otherUserId = match.profile_id_1 === user.id ? match.profile_id_2 : match.profile_id_1;
          const otherUserProfile = profileMap.get(otherUserId);
          
          if (!otherUserProfile) continue; // Skip if profile not found
          
          // Get the activity info
          const activity = roundToActivityMap.get(match.round_id);
          if (!activity) continue; // Skip if activity not found
          
          // Check feedback status
          const myFeedback = feedbackData?.find(f => f.match_id === match.id && f.profile_id === user.id);
          const otherUserFeedback = feedbackData?.find(f => f.match_id === match.id && f.profile_id === otherUserId);
          
          // Determine feedback states
          const hasGivenFeedback = !!myFeedback;
          const hasPositiveFeedback = myFeedback ? myFeedback.is_positive : false;
          let otherUserFeedbackStatus: 'positive' | 'negative' | 'none' = 'none';
          if (otherUserFeedback) {
            otherUserFeedbackStatus = otherUserFeedback.is_positive ? 'positive' : 'negative';
          }
          
          // For the Matches tab, only show mutual positive matches
          const shouldShow = !activityId || otherUserFeedbackStatus === 'positive' && hasPositiveFeedback;
          
          if (activityId && !shouldShow) continue; // Skip non-mutual matches in activity view
          
          // Determine which reason/icebreaker to show
          let matchReason = '';
          let icebreaker = '';
          if (match.profile_id_1 === user.id) {
            matchReason = match.match_reason_1 || 'You seem to be compatible based on your answers.';
            icebreaker = match.icebreaker_1 || 'What brings you to this activity?';
          } else {
            matchReason = match.match_reason_2 || 'You seem to be compatible based on your answers.';
            icebreaker = match.icebreaker_2 || 'What brings you to this activity?';
          }
          
          const processedMatch: ProcessedMatch = {
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
      } catch (error) {
        console.error("MatchList Error:", error);
        toast.error("Failed to load matches");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, [user, activityId]);

  const handlePositiveFeedback = async (matchId: string) => {
    try {
      if (!user) return;
      
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
          
        if (error) throw error;
      } else {
        // Insert new feedback
        const { error } = await supabase
          .from('match_feedback')
          .insert({
            match_id: parseInt(matchId),
            profile_id: user.id,
            is_positive: true,
          });
          
        if (error) throw error;
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
          } else {
            toast.success("Positive feedback submitted!");
          }
          
          return updatedMatch;
        }
        return match;
      }));
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const handleNegativeFeedback = async (matchId: string, reason: string) => {
    try {
      if (!user) return;
      
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
          
        if (error) throw error;
      } else {
        // Insert new feedback
        const { error } = await supabase
          .from('match_feedback')
          .insert({
            match_id: parseInt(matchId),
            profile_id: user.id,
            is_positive: false,
            reason: reason
          });
          
        if (error) throw error;
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
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const handleOpenFeedback = (matchId: string, type: "positive" | "negative") => {
    setCurrentMatchId(matchId);
    setFeedbackType(type);
  };

  // Get matches to display based on context
  let displayMatches = matches;
  if (historyMode) {
    displayMatches = matches.filter(m => m.hasPositiveFeedback && m.otherUserFeedback === 'positive');
  } else if (activityId) {
    displayMatches = matches.filter(m => m.shouldShow);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-60" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (displayMatches.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">
            {activityId && activityId !== 'all'
              ? "No mutual matches found for this activity."
              : "You don't have any matches yet."}
          </p>
          <p className="mt-2">
            {activityId && activityId !== 'all'
              ? "Try selecting a different activity or check back later."
              : "Join some activities to start matching with others!"}
          </p>
          {(!activityId || activityId === 'all') && (
            <Button className="mt-4" asChild>
              <a href="/activities">Browse Activities</a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {displayMatches.map((match) => {
          const isRejected = match.hasGivenFeedback && !match.hasPositiveFeedback;
          
          return (
            <Card 
              key={match.id} 
              className={`overflow-hidden ${isRejected ? "opacity-60" : ""}`}
            >
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <img 
                        src={match.photoUrl || "https://i.pravatar.cc/150?img=32"} 
                        alt={match.name} 
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                        <h3 className="text-xl font-semibold">{match.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          Matched on {new Date(match.matchDate).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Activity: {match.activityName}
                      </p>
                      <div className="bg-muted/50 p-3 rounded-md my-2">
                        <p className="text-sm">{match.matchReason}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-accent-foreground bg-accent/50 p-2 rounded-md">
                        <MessageCircle size={16} />
                        <span className="italic">{match.icebreaker}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t bg-muted/30 p-4 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">Match score:</span> {match.matchScore}%
                  </div>
                  
                  {/* Show feedback status or feedback buttons */}
                  <div>
                    {match.hasGivenFeedback ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Your feedback:</span>
                        {match.hasPositiveFeedback ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <ThumbsUp size={16} />
                            Good match
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <ThumbsDown size={16} />
                            Not a fit
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Dialog open={feedbackType === "negative" && currentMatchId === match.id} onOpenChange={(open) => {
                          if (!open) {
                            setFeedbackType(null);
                            setCurrentMatchId(null);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1"
                              onClick={() => handleOpenFeedback(match.id, "negative")}
                            >
                              <ThumbsDown size={16} />
                              <span className="hidden md:inline">Not a fit</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Feedback for match with {match.name}</DialogTitle>
                              <DialogDescription>
                                We're sorry this wasn't a good match. Please let us know why so we can improve.
                              </DialogDescription>
                            </DialogHeader>
                            <NegativeFeedbackForm 
                              onSubmit={(reason) => handleNegativeFeedback(match.id, reason)}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="gap-1"
                          onClick={() => handlePositiveFeedback(match.id)}
                        >
                          <ThumbsUp size={16} />
                          <span className="hidden md:inline">Good match</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};

interface NegativeFeedbackFormProps {
  onSubmit: (reason: string) => void;
}

const NegativeFeedbackForm = ({ onSubmit }: NegativeFeedbackFormProps) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reason">What wasn't a good fit? (optional)</Label>
        <Textarea 
          id="reason" 
          placeholder="e.g., Different interests, location too far, etc." 
          value={reason} 
          onChange={(e) => setReason(e.target.value)} 
        />
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Submit Feedback</Button>
      </DialogFooter>
    </form>
  );
};

export default MatchList;

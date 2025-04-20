
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
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

interface ProcessedMatch {
  id: string;
  name: string;
  activityName: string;
  matchDate: string;
  matchScore: number;
  matchReason: string;
  icebreaker: string;
  photoUrl: string | null;
  feedbackGiven: boolean;
  feedback?: "positive" | "negative";
}

const MatchHistory = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<ProcessedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackType, setFeedbackType] = useState<"positive" | "negative" | null>(null);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchHistory = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get the matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('match')
          .select(`
            id,
            match_score,
            match_reason,
            icebreaker,
            created_at,
            round:round_id (
              activity:activity_id (
                title
              )
            ),
            profile:profile_id_2 (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('profile_id_1', user.id)
          .order('created_at', { ascending: false });
        
        if (matchesError) throw matchesError;
        
        // Get the user's feedback on matches
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('match_feedback')
          .select('match_id, is_positive')
          .eq('profile_id', user.id);
        
        if (feedbackError) throw feedbackError;
        
        // Process the matches data with feedback information
        const processedMatches: ProcessedMatch[] = [];
        
        if (matchesData) {
          for (const match of matchesData) {
            if (match.profile && match.round?.activity) {
              // Find feedback for this match
              const feedback = feedbackData?.find((f) => f.match_id === match.id);
              
              processedMatches.push({
                id: match.id.toString(),
                name: `${match.profile.first_name || ''} ${match.profile.last_name || ''}`.trim() || 'Unnamed User',
                activityName: match.round.activity.title || 'Unnamed Activity',
                matchDate: new Date(match.created_at).toISOString().split('T')[0],
                matchScore: match.match_score,
                matchReason: match.match_reason || 'You seem to be compatible based on your answers.',
                icebreaker: match.icebreaker || 'What brings you to this activity?',
                photoUrl: match.profile.avatar_url,
                feedbackGiven: !!feedback,
                feedback: feedback ? (feedback.is_positive ? "positive" : "negative") : undefined,
              });
            }
          }
        }
        
        setMatches(processedMatches);
      } catch (error) {
        console.error("Error fetching match history:", error);
        toast.error("Failed to load match history");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatchHistory();
  }, [user]);

  const handlePositiveFeedback = async (matchId: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('match_feedback')
        .insert({
          match_id: parseInt(matchId),
          profile_id: user.id,
          is_positive: true,
        });
        
      if (error) throw error;
      
      // Update the local state to reflect the feedback
      setMatches(matches.map(match => 
        match.id === matchId 
          ? { ...match, feedbackGiven: true, feedback: "positive" } 
          : match
      ));
      
      toast.success("Positive feedback submitted!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const handleNegativeFeedback = async (matchId: string, reason: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('match_feedback')
        .insert({
          match_id: parseInt(matchId),
          profile_id: user.id,
          is_positive: false,
          reason
        });
        
      if (error) throw error;
      
      // Update the local state to reflect the feedback
      setMatches(matches.map(match => 
        match.id === matchId 
          ? { ...match, feedbackGiven: true, feedback: "negative" } 
          : match
      ));
      
      toast.success("Feedback submitted, thanks for helping us improve!");
      
      // Close the dialog
      setCurrentMatchId(null);
      setFeedbackType(null);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const handleOpenFeedback = (matchId: string, type: "positive" | "negative") => {
    setCurrentMatchId(matchId);
    setFeedbackType(type);
  };

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

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">You don't have any matches yet.</p>
          <p className="mt-2">Join some activities to start matching with others!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map(match => (
        <Card key={match.id} className="overflow-hidden">
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
                <div className="flex-1 space-y-2">
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
              <div>
                {match.feedbackGiven ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Your feedback:</span>
                    {match.feedback === "positive" ? (
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
      ))}
    </div>
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

export default MatchHistory;

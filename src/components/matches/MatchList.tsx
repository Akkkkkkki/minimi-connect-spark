import { useState } from "react";
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

interface MatchListProps {
  activityId?: string;
}

const MatchList = ({ activityId }: MatchListProps) => {
  // Mock data - would come from Supabase in real implementation
  const allMatches = [
    {
      id: "1",
      name: "Alex Johnson",
      activityName: "Tech Networking Coffee",
      activityId: "1",
      matchDate: "2025-04-15",
      matchScore: 85,
      matchReason: "You both share interests in AI and startups, plus you're both early risers who enjoy a morning coffee chat!",
      icebreaker: "Ask about their favorite AI application they've seen recently.",
      photoUrl: "https://i.pravatar.cc/150?img=68",
    },
    {
      id: "2",
      name: "Riley Chen",
      activityName: "Hiking Club Meetup",
      activityId: "2",
      matchDate: "2025-04-15",
      matchScore: 78,
      matchReason: "Both of you love outdoor activities and photography. Riley has also visited 3 of the same national parks as you!",
      icebreaker: "What's your favorite hiking spot near the city?",
      photoUrl: "https://i.pravatar.cc/150?img=35",
    },
    {
      id: "3",
      name: "Jordan Smith",
      activityName: "Startup Weekend",
      activityId: "3",
      matchDate: "2025-04-10",
      matchScore: 92,
      matchReason: "You both have startup experience and complementary skills - your marketing background pairs well with Jordan's technical expertise.",
      icebreaker: "What inspired you to join Startup Weekend?",
      photoUrl: "https://i.pravatar.cc/150?img=12",
    }
  ];

  // Filter matches by activity if specified
  const matches = activityId 
    ? allMatches.filter(match => match.activityId === activityId)
    : allMatches;

  const [feedbackType, setFeedbackType] = useState<"positive" | "negative" | null>(null);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);

  const handlePositiveFeedback = (matchId: string) => {
    toast.success("Positive feedback submitted!");
    // This would be a Supabase API call in production
    console.log("Positive feedback for match:", matchId);
  };

  const handleNegativeFeedback = (matchId: string, reason: string) => {
    toast.success("Feedback submitted, thanks for helping us improve!");
    // This would be a Supabase API call in production
    console.log("Negative feedback for match:", matchId, "Reason:", reason);
  };

  const handleOpenFeedback = (matchId: string, type: "positive" | "negative") => {
    setCurrentMatchId(matchId);
    setFeedbackType(type);
  };

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">
            {activityId
              ? "No matches found for this activity."
              : "You don't have any matches yet."}
          </p>
          <p className="mt-2">
            {activityId
              ? "Try selecting a different activity or check back later."
              : "Join some activities to start matching with others!"}
          </p>
          {!activityId && (
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
        {matches.map(match => (
          <Card key={match.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img 
                      src={match.photoUrl} 
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
              </div>
            </CardContent>
          </Card>
        ))}
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

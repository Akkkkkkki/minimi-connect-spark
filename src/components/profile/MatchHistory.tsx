
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";

const MatchHistory = () => {
  // Mock data - would come from Supabase in real implementation
  const matches = [
    {
      id: "1",
      name: "Alex Johnson",
      activityName: "Tech Networking Coffee",
      matchDate: "2025-03-15",
      matchScore: 85,
      matchReason: "You both share interests in AI and startups, plus you're both early risers who enjoy a morning coffee chat!",
      icebreaker: "Ask about their favorite AI application they've seen recently.",
      photoUrl: "https://i.pravatar.cc/150?img=68",
      feedbackGiven: true,
      feedback: "positive"
    },
    {
      id: "2",
      name: "Riley Chen",
      activityName: "Hiking Club Meetup",
      matchDate: "2025-02-28",
      matchScore: 78,
      matchReason: "Both of you love outdoor activities and photography. Riley has also visited 3 of the same national parks as you!",
      icebreaker: "What's your favorite hiking spot near the city?",
      photoUrl: "https://i.pravatar.cc/150?img=35",
      feedbackGiven: true,
      feedback: "negative"
    },
    {
      id: "3",
      name: "Jordan Smith",
      activityName: "Startup Weekend",
      matchDate: "2025-02-10",
      matchScore: 92,
      matchReason: "You both have startup experience and complementary skills - your marketing background pairs well with Jordan's technical expertise.",
      icebreaker: "What inspired you to join Startup Weekend?",
      photoUrl: "https://i.pravatar.cc/150?img=12",
      feedbackGiven: false,
    }
  ];

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
                    src={match.photoUrl} 
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
                    <Button size="sm" variant="outline" className="gap-1">
                      <ThumbsDown size={16} />
                      <span className="hidden md:inline">Not a fit</span>
                    </Button>
                    <Button size="sm" variant="default" className="gap-1">
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

export default MatchHistory;

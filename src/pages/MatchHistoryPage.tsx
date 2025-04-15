
import PageLayout from "@/components/layout/PageLayout";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MatchHistoryPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState("all");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please sign in to view your match history", {
        description: "You'll be redirected to the login page"
      });
      setTimeout(() => navigate("/login"), 1500);
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Mock data for activities - in a real implementation, this would be fetched from Supabase
  const userActivities = [
    { id: "1", name: "Tech Networking Coffee" },
    { id: "2", name: "Hiking Club Meetup" },
    { id: "3", name: "Startup Weekend" },
  ];

  // Mock data for confirmed matches - would come from Supabase in real implementation
  // This would only include matches where the user has provided positive feedback
  const allMatches = [
    {
      id: "1",
      name: "Alex Johnson",
      activityName: "Tech Networking Coffee",
      activityId: "1",
      matchDate: "2025-03-15",
      matchScore: 85,
      matchReason: "You both share interests in AI and startups, plus you're both early risers who enjoy a morning coffee chat!",
      icebreaker: "Ask about their favorite AI application they've seen recently.",
      photoUrl: "https://i.pravatar.cc/150?img=68",
      feedback: "positive"
    },
    {
      id: "3",
      name: "Jordan Smith",
      activityName: "Startup Weekend",
      activityId: "3",
      matchDate: "2025-02-10",
      matchScore: 92,
      matchReason: "You both have startup experience and complementary skills - your marketing background pairs well with Jordan's technical expertise.",
      icebreaker: "What inspired you to join Startup Weekend?",
      photoUrl: "https://i.pravatar.cc/150?img=12",
      feedback: "positive"
    }
  ];

  // Filter matches by activity if specified
  const matches = selectedActivity === "all" 
    ? allMatches 
    : allMatches.filter(match => match.activityId === selectedActivity);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Loading...</h1>
        </div>
      </PageLayout>
    );
  }

  if (matches.length === 0) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Match History</h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Here are your confirmed matches with mutual interest.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
            <h2 className="text-xl font-medium">Confirmed Matches</h2>
            <Select 
              value={selectedActivity} 
              onValueChange={setSelectedActivity}
            >
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select an activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                {userActivities.map(activity => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">
                {selectedActivity !== "all" 
                  ? "No confirmed matches for this activity." 
                  : "You don't have any confirmed matches yet."}
              </p>
              <p className="mt-2">
                {selectedActivity !== "all"
                  ? "Try selecting a different activity or check back later."
                  : "Check your recommendations and express interest to create matches!"}
              </p>
              <Button className="mt-4" asChild>
                <a href="/matches">View Recommendations</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Match History</h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Here are your confirmed matches with mutual interest.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <h2 className="text-xl font-medium">Confirmed Matches</h2>
          <Select 
            value={selectedActivity} 
            onValueChange={setSelectedActivity}
          >
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select an activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              {userActivities.map(activity => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Your feedback:</span>
                    <span className="flex items-center gap-1 text-green-600">
                      <ThumbsUp size={16} />
                      Good match
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default MatchHistoryPage;

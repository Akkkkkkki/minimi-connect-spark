
import PageLayout from "@/components/layout/PageLayout";
import MatchList from "@/components/matches/MatchList";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MatchResults = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState("all");

  // Mock data for activities - in a real implementation, this would be fetched from Supabase
  const userActivities = [
    { id: "1", name: "Tech Networking Coffee" },
    { id: "2", name: "Hiking Club Meetup" },
    { id: "3", name: "Startup Weekend" },
  ];

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      toast.error("Please sign in to view your matches", {
        description: "You'll be redirected to the login page"
      });
      setTimeout(() => navigate("/login"), 1500);
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Loading...</h1>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Your Recommendations</h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Here are your current recommended profiles. Provide feedback to help us improve your future matches.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <h2 className="text-xl font-medium">Recommended Profiles</h2>
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
        
        <MatchList activityId={selectedActivity === "all" ? undefined : selectedActivity} />
      </div>
    </PageLayout>
  );
};

export default MatchResults;

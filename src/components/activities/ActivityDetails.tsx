import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityDetailsProps {
  activityId: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: "upcoming" | "completed";
  type: string;
  participants: number;
  maxParticipants: number;
  tags: string[];
  hasCompletedQuestionnaire?: boolean;
  image?: string;
}

const ActivityDetails = ({ activityId }: ActivityDetailsProps) => {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching activity data
    const fetchActivity = async () => {
      // This would be a real API call in production
      setLoading(true);
      
      // Mock data for demonstration
      const mockActivity: Activity = {
        id: activityId,
        title: activityId === "1" ? "Tech Networking Coffee" : 
               activityId === "2" ? "Hiking Club Meetup" : "Startup Weekend",
        description: "Join this event to connect with like-minded professionals in a casual setting. Whether you're looking to expand your network, find potential collaborators, or just enjoy talking shop, this is the perfect opportunity.",
        date: activityId === "1" ? "2025-04-20" : 
              activityId === "2" ? "2025-03-15" : "2025-02-10",
        time: activityId === "1" ? "09:00 AM" : 
              activityId === "2" ? "08:00 AM" : "06:00 PM",
        location: activityId === "1" ? "Digital Cafe, Berlin" : 
                 activityId === "2" ? "Grunewald Forest, Berlin" : "Innovation Hub, Berlin",
        status: activityId === "1" ? "upcoming" : "completed",
        type: activityId === "1" || activityId === "3" ? "professional" : "hobby",
        participants: activityId === "1" ? 14 : 
                     activityId === "2" ? 8 : 32,
        maxParticipants: 40,
        tags: activityId === "1" ? ["Networking", "Tech", "Professional"] : 
              activityId === "2" ? ["Outdoors", "Hiking", "Sports"] : ["Startup", "Tech", "Innovation"],
        hasCompletedQuestionnaire: activityId !== "1"
      };
      
      // Simulate network delay
      setTimeout(() => {
        setActivity(mockActivity);
        setLoading(false);
      }, 500);
    };
    
    fetchActivity();
  }, [activityId]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-8 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activity) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Activity not found</p>
        </CardContent>
      </Card>
    );
  }

  const formattedDate = new Date(activity.date).toLocaleDateString();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{activity.title}</CardTitle>
          <Badge variant={activity.status === "upcoming" ? "default" : "outline"}>
            {activity.status === "upcoming" ? "Upcoming" : "Completed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">{activity.description}</p>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {activity.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              <Tag className="h-3 w-3 mr-1" /> {tag}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {formattedDate}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {activity.time}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {activity.location}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              {activity.participants} / {activity.maxParticipants} participants
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            {activity.status === "upcoming" && !activity.hasCompletedQuestionnaire && (
              <Button>Complete Questionnaire</Button>
            )}
            {activity.status === "upcoming" && activity.hasCompletedQuestionnaire && (
              <Button variant="outline">Edit Answers</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityDetails; 

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const JoinedActivities = () => {
  // Mock data - would come from Supabase in real implementation
  const activities = [
    {
      id: "1",
      title: "Tech Networking Coffee",
      date: "2025-04-20T09:00:00",
      location: "Digital Cafe, Berlin",
      status: "upcoming",
      type: "professional",
      participants: 14,
      hasCompletedQuestionnaire: false
    },
    {
      id: "2",
      title: "Hiking Club Meetup",
      date: "2025-03-15T08:00:00",
      location: "Grunewald Forest, Berlin",
      status: "completed",
      type: "hobby",
      participants: 8,
      hasCompletedQuestionnaire: true
    },
    {
      id: "3",
      title: "Startup Weekend",
      date: "2025-02-10T18:00:00",
      location: "Innovation Hub, Berlin",
      status: "completed",
      type: "professional",
      participants: 32,
      hasCompletedQuestionnaire: true
    }
  ];

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">You haven't joined any activities yet.</p>
          <p className="mt-2">Browse our activities and join ones that interest you!</p>
          <Button className="mt-4" asChild>
            <a href="/activities">Browse Activities</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <Card key={activity.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{activity.title}</h3>
                  {activity.status === "upcoming" ? (
                    <Badge>Upcoming</Badge>
                  ) : (
                    <Badge variant="outline">Completed</Badge>
                  )}
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {activity.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {activity.participants} participants
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                {activity.status === "upcoming" && !activity.hasCompletedQuestionnaire && (
                  <Button>Complete Questionnaire</Button>
                )}
                {activity.status === "upcoming" && activity.hasCompletedQuestionnaire && (
                  <Button variant="outline">Edit Answers</Button>
                )}
                {activity.status === "completed" && (
                  <Button variant="outline">View Details</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JoinedActivities;

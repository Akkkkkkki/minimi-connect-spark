
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, MapPin, MoreVertical, Settings, Trash, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface ActivityListProps {
  onSelectActivity: (id: string) => void;
}

const ActivityList = ({ onSelectActivity }: ActivityListProps) => {
  // Mock data - would come from Supabase in real implementation
  const activities = [
    {
      id: "1",
      title: "Tech Networking Coffee",
      date: "2025-04-20T09:00:00",
      location: "Digital Cafe, Berlin",
      status: "upcoming",
      type: "professional",
      participants: 14
    },
    {
      id: "2",
      title: "Hiking Club Meetup",
      date: "2025-03-15T08:00:00",
      location: "Grunewald Forest, Berlin",
      status: "completed",
      type: "hobby",
      participants: 8
    }
  ];

  const handleEdit = (id: string) => {
    toast.info("Edit functionality not implemented in demo");
  };

  const handleDelete = (id: string) => {
    toast.info("Delete functionality not implemented in demo");
  };

  const handleManageMatches = (id: string) => {
    onSelectActivity(id);
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">You haven't created any activities yet.</p>
          <Button className="mt-4">Create Your First Activity</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <Card key={activity.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">{activity.title}</h3>
                    {activity.status === "upcoming" ? (
                      <Badge>Upcoming</Badge>
                    ) : (
                      <Badge variant="outline">Completed</Badge>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(activity.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleManageMatches(activity.id)}>
                        <Settings className="mr-2 h-4 w-4" /> Manage Matches
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={() => handleDelete(activity.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => handleEdit(activity.id)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button onClick={() => handleManageMatches(activity.id)}>
                  Manage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivityList;

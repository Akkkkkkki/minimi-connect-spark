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
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityListProps {
  onSelectActivity: (id: string) => void;
  statusFilter?: 'upcoming' | 'completed';
}

const ActivityList = ({ onSelectActivity, statusFilter = 'upcoming' }: ActivityListProps) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get activities created by this user
        const { data, error } = await supabase
          .from('activity')
          .select(`*, activity_questionnaire (id), activity_participant (id)`)
          .eq('creator_id', user.id);
          
        if (error) throw error;
        
        if (data) {
          // Process and format activity data
          const processedActivities = data.map(activity => {
            const hasQuestionnaire = activity.activity_questionnaire && activity.activity_questionnaire.length > 0;
            const now = new Date();
            let status = "upcoming";
            if (activity.end_time) {
              status = new Date(activity.end_time) <= now ? "completed" : "upcoming";
            } else if (activity.start_time) {
              status = new Date(activity.start_time) <= now ? "completed" : "upcoming";
            }
            return {
              ...activity,
              status,
              participants: activity.activity_participant ? activity.activity_participant.length : 0,
              hasQuestionnaire
            };
          });
          
          setActivities(processedActivities);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast.error("Failed to load your activities");
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [user]);

  const handleEdit = (id: string) => {
    navigate(`/edit-activity/${id}`);
  };

  const handleDelete = (id: string) => {
    toast.info("Delete functionality not implemented in demo");
  };

  const handleManageMatches = (id: string) => {
    onSelectActivity(id);
  };
  
  const handleEditQuestionnaire = (id: string) => {
    navigate(`/activity-management/${id}/questionnaire`);
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="flex justify-end mt-4">
                <Skeleton className="h-10 w-24 mr-2" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">You haven't created any activities yet.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate("/create-activity")}
          >
            Create Your First Activity
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Filter activities by statusFilter
  const filteredActivities = activities.filter(activity => activity.status === statusFilter);

  if (filteredActivities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">No {statusFilter} activities found.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate("/create-activity")}
          >
            Create Activity
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredActivities.map(activity => (
        <Card key={activity.id.toString()} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between items-start gap-2">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-medium truncate">{activity.title}</h3>
                    {activity.status === "upcoming" ? (
                      <Badge>Upcoming</Badge>
                    ) : (
                      <Badge variant="outline">Completed</Badge>
                    )}
                    {activity.hasQuestionnaire && (
                      <Badge variant="secondary">Has Questionnaire</Badge>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(activity.start_time).toLocaleDateString()} at {new Date(activity.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                    {activity.status === "upcoming" && (
                      <DropdownMenuItem onClick={() => handleEdit(activity.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleManageMatches(activity.id)}>
                      <Settings className="mr-2 h-4 w-4" /> Manage Matches
                    </DropdownMenuItem>
                    {activity.status === "upcoming" && (
                      <DropdownMenuItem onClick={() => handleEditQuestionnaire(activity.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {activity.hasQuestionnaire ? 'Edit' : 'Create'} Questionnaire
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(activity.id)}>
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivityList;

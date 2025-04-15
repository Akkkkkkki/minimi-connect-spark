
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
}

const ActivityList = ({ onSelectActivity }: ActivityListProps) => {
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
          .from('activities')
          .select(`
            *,
            questionnaires (
              id
            ),
            activity_participants (
              id
            )
          `)
          .eq('creator_id', user.id);
          
        if (error) throw error;
        
        if (data) {
          // Process and format activity data
          const processedActivities = data.map(activity => ({
            ...activity,
            status: new Date(activity.start_time) > new Date() ? "upcoming" : "completed",
            participants: activity.activity_participants ? activity.activity_participants.length : 0,
            hasQuestionnaire: activity.questionnaires && activity.questionnaires.length > 0
          }));
          
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
    toast.info("Edit functionality not implemented in demo");
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
                    {activity.hasQuestionnaire && (
                      <Badge variant="secondary">Has Questionnaire</Badge>
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
                      <DropdownMenuItem 
                        onClick={() => handleEditQuestionnaire(activity.id)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> {activity.hasQuestionnaire ? 'Edit' : 'Create'} Questionnaire
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

              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => handleEdit(activity.id)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button onClick={() => handleManageMatches(activity.id)}>
                  Manage
                </Button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button
                variant={activity.hasQuestionnaire ? "outline" : "default"}
                onClick={() => handleEditQuestionnaire(activity.id)}
                size="sm"
              >
                {activity.hasQuestionnaire ? "Edit Questionnaire" : "Create Questionnaire"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivityList;

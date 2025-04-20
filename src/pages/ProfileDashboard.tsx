
import PageLayout from "@/components/layout/PageLayout";
import ProfileInfo from "@/components/profile/ProfileInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConnectionsList from "@/components/match/ConnectionsList";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileDashboard = () => {
  const { user, isLoading } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<string>("all");

  useEffect(() => {
    const fetchUserActivities = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get activities the user has participated in
        const { data, error } = await supabase
          .from('activity_participant')
          .select(`
            activity:activity_id (
              id,
              title,
              start_time,
              end_time,
              activity_type,
              location
            )
          `)
          .eq('profile_id', user.id);
        
        if (error) throw error;
        
        // Extract unique activities from the response
        const uniqueActivities = data ? data.reduce((acc: any[], item: any) => {
          if (item.activity && !acc.some((a) => a.id === item.activity.id)) {
            acc.push(item.activity);
          }
          return acc;
        }, []) : [];
        
        setActivities(uniqueActivities);
        
        // Set default selected activity if any exist
        if (uniqueActivities.length > 0) {
          setSelectedActivity(uniqueActivities[0].id.toString());
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast.error("Failed to load your activities");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserActivities();
  }, [user]);

  if (isLoading || loading) {
    return (
      <PageLayout>
        <div className="space-y-6 mt-4">
          <Skeleton className="h-10 w-64" />
          <div className="mt-6 space-y-8">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Profile Dashboard</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <ProfileInfo />
          </TabsContent>
          
          <TabsContent value="connections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Filter by activity:</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                  >
                    <option value="all">All Activities</option>
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.id.toString()}>
                        {activity.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <ConnectionsList activityId={selectedActivity} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Activities</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    You haven't joined any activities yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <Card key={activity.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-medium">{activity.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {activity.location} | {new Date(activity.start_time).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-2">
                              <span className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs">
                                {activity.activity_type}
                              </span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ProfileDashboard;

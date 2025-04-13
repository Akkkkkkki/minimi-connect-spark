import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileInfo from "@/components/profile/ProfileInfo";
import { useAuth } from "@/context/AuthContext";

const ProfileDashboard = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Profile Dashboard</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-1">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-6">
            <ProfileInfo />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ProfileDashboard;

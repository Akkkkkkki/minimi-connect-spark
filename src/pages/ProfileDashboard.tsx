
import PageLayout from "@/components/layout/PageLayout";
import ProfileInfo from "@/components/profile/ProfileInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchHistory from "@/components/profile/MatchHistory";

const ProfileDashboard = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Profile Dashboard</h1>
        <div className="mt-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="match-history">Match History</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <ProfileInfo />
            </TabsContent>
            <TabsContent value="match-history">
              <MatchHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfileDashboard;

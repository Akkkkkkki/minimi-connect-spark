
import PageLayout from "@/components/layout/PageLayout";
import ProfileInfo from "@/components/profile/ProfileInfo";

const ProfileDashboard = () => {
  return (
    <PageLayout>
      <div className="space-y-6 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Profile Dashboard</h1>
        <div className="mt-6">
          <ProfileInfo />
        </div>
      </div>
    </PageLayout>
  );
};

export default ProfileDashboard;

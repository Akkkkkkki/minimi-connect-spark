import PageLayout from "@/components/layout/PageLayout";
import ProfileInfo from "@/components/profile/ProfileInfo";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileDashboard = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
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
        <ProfileInfo />
      </div>
    </PageLayout>
  );
};

export default ProfileDashboard;

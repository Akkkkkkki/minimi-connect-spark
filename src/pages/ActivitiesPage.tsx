
import PageLayout from "@/components/layout/PageLayout";
import ActivitiesList from "@/components/activities/ActivitiesList";

const ActivitiesPage = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Explore Activities</h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Discover and join activities that match your interests. From romantic encounters to professional networking, 
          find the perfect event to connect with like-minded people.
        </p>
        
        <ActivitiesList />
      </div>
    </PageLayout>
  );
};

export default ActivitiesPage;

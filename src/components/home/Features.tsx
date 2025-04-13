
import { Users, Calendar, Activity, Zap } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Multiple Connection Types",
    description: "Find matches for dating, professional networking, or shared activities all in one platform."
  },
  {
    icon: Calendar,
    title: "Activity-Based Matching",
    description: "Join events and get matched with compatible participants based on your preferences and answers."
  },
  {
    icon: Activity,
    title: "Intelligent Criteria",
    description: "Our smart algorithm uses both hard and soft constraints to find your ideal connections."
  },
  {
    icon: Zap,
    title: "Multiple Matching Rounds",
    description: "Participate in several matching rounds within a single activity for more opportunities."
  }
];

const Features = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">How MINIMI Works</h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600 text-lg">
            Our platform uses intelligent matching to help you form meaningful connections across different contexts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description: "Sign up and fill in your personal details, preferences, and upload a profile photo."
  },
  {
    number: "02",
    title: "Explore events",
    description: "Browse through various events that match your interests and location."
  },
  {
    number: "03",
    title: "Answer questionnaires",
    description: "Complete event-specific questionnaires to help our algorithm find compatible matches."
  },
  {
    number: "04",
    title: "Get matched",
    description: "Receive your matches at the designated time and connect with your compatible partners."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">Get Started in 4 Easy Steps</h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600 text-lg">
            From sign-up to making meaningful connections, our process is simple and effective.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm relative">
              <span className="text-4xl font-bold text-accent/10">{step.number}</span>
              <h3 className="text-xl font-semibold text-primary mt-4 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5L16 12L9 19" stroke="#6C5CE7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;


import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-16 md:py-24 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to find your meaningful connections?
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Join thousands of users who are already finding compatible matches for dating, networking, and activities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-accent hover:bg-gray-100 w-full sm:w-auto">
                Create Your Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/activities">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                Browse Activities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

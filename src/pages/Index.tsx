import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <PageLayout fullWidth>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link to="/events">Browse Events</Link>
      </Button>
    </PageLayout>
  );
};

export default Index;

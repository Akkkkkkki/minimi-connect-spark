
import PageLayout from "@/components/layout/PageLayout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";

const Index = () => {
  return (
    <PageLayout fullWidth>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </PageLayout>
  );
};

export default Index;

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative bg-gradient-to-br from-accent/5 to-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary">
              Connect with people who 
              <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text"> match your vibe</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl">
              Find compatible connections for romance, professional networking, or shared events 
              with MINIMI's intelligent matching platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/events">
                <Button size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  Browse Events <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/10 rounded-full animate-float" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-accent/20 rounded-full animate-float" style={{ animationDelay: '2s'}} />
              
              <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-primary">Mountain Hiking Group</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">Event</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-48 bg-gray-200 rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center text-accent">
                        Event Image
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Location:</span>
                        <span className="text-sm font-medium">Rocky Mountains</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Date:</span>
                        <span className="text-sm font-medium">June 15, 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Participants:</span>
                        <span className="text-sm font-medium">18/24</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-accent hover:bg-accent/90">
                      Join Event
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

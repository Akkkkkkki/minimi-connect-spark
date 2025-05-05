import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  UserCircle, 
  Search, 
  CheckCircle, 
  MessageSquare, 
  ThumbsUp, 
  AlertCircle 
} from "lucide-react";

const HowItWorksPage = () => {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">How MINIMI Works</h1>
          <p className="text-lg text-gray-600">
            Our platform uses intelligent matching to help you form meaningful connections across different contexts.
            Here's a step-by-step guide to get started.
          </p>
        </div>
        
        <div className="space-y-16">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3">
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <UserCircle className="w-12 h-12 text-accent" />
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-semibold mb-3 text-primary">1. Create Your Profile</h2>
              <p className="text-gray-600">
                Sign up and complete your profile with basic information. Add details about yourself, upload a profile photo, 
                and specify your preferences. The more information you provide, the better we can match you with compatible connections.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Name & Gender</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Birth Month/Year</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Profile Photo</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Location</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Interests</span>
              </div>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/3">
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-accent" />
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-semibold mb-3 text-primary">2. Browse & Join All Activities</h2>
              <p className="text-gray-600">
                Explore our catalog of activities and events. Filter by type, location, date, or interests to find activities 
                that appeal to you. When you find something interesting, join to be included in the matching process.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Romance</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Professional</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Outdoor</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Social</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Education</span>
              </div>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3">
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-accent" />
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-semibold mb-3 text-primary">3. Answer Questionnaires</h2>
              <p className="text-gray-600">
                Each activity has a custom questionnaire designed by the creator. Answer all questions honestly to help our 
                algorithm find the most compatible matches for you. These could be multiple choice questions or short answers.
              </p>
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium text-primary mb-2">Sample Questions:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• What are your main goals for this networking event?</li>
                  <li>• How would you describe your hiking experience level?</li>
                  <li>• What qualities do you value most in a potential partner?</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/3">
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-12 h-12 text-accent" />
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-semibold mb-3 text-primary">4. Receive Your Matches</h2>
              <p className="text-gray-600">
                At the designated matching time set by the activity creator, our algorithm will process all participants' 
                information and provide you with matches. You'll receive match details along with compatibility reasoning 
                and icebreaker suggestions.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 border border-accent/20 rounded-lg bg-accent/5">
                  <h4 className="font-medium text-primary">Hard Constraints</h4>
                  <p className="text-sm text-gray-600 mt-1">Gender, location, industry, etc.</p>
                </div>
                <div className="p-3 border border-accent/20 rounded-lg bg-accent/5">
                  <h4 className="font-medium text-primary">Soft Constraints</h4>
                  <p className="text-sm text-gray-600 mt-1">Interests, values, communication style</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Step 5 */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3">
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-12 h-12 text-accent" />
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-2xl font-semibold mb-3 text-primary">5. Provide Feedback</h2>
              <p className="text-gray-600">
                After connecting with your matches, provide feedback on the quality of the match. This helps us improve 
                our algorithm for future matches and helps activity creators understand the success of their events.
              </p>
              <div className="mt-4 flex gap-4">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Great match!</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-gray-600">Not quite right</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 text-center">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Ready to Find Your Connections?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/activities">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Browse All Activities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HowItWorksPage;

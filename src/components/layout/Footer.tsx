import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="text-2xl font-bold">MINIMI</Link>
            <p className="mt-2 text-gray-300 text-sm">
              The universal matching platform for meaningful connections.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><Link to="/activities" className="text-gray-300 hover:text-accent transition-colors">Browse All Activities</Link></li>
              <li><Link to="/how-it-works" className="text-gray-300 hover:text-accent transition-colors">How It Works</Link></li>
              <li><Link to="/success-stories" className="text-gray-300 hover:text-accent transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-300 hover:text-accent transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-300 hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-gray-300 hover:text-accent transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} MINIMI. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center text-gray-400 text-sm">
            <span>Made with</span>
            <Heart className="h-4 w-4 mx-1 text-accent" />
            <span>for meaningful connections</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

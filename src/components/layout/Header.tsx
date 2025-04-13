
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, UserPlus } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-4 md:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">MINIMI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/activities" className="text-primary hover:text-accent transition-colors">
            Explore Activities
          </Link>
          <Link to="/how-it-works" className="text-primary hover:text-accent transition-colors">
            How It Works
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-accent hover:bg-accent/90 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Sign up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden text-primary focus:outline-none"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-md animate-fade-in">
          <div className="flex flex-col p-4 space-y-4">
            <Link to="/activities" className="text-primary hover:text-accent transition-colors py-2" onClick={toggleMenu}>
              Explore Activities
            </Link>
            <Link to="/how-it-works" className="text-primary hover:text-accent transition-colors py-2" onClick={toggleMenu}>
              How It Works
            </Link>
            <hr className="border-gray-200" />
            <Link to="/login" onClick={toggleMenu}>
              <Button variant="outline" className="w-full justify-center gap-2">
                <LogIn className="h-4 w-4" />
                Log in
              </Button>
            </Link>
            <Link to="/signup" onClick={toggleMenu}>
              <Button className="w-full bg-accent hover:bg-accent/90 justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

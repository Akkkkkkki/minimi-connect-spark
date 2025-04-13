
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Heart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock authentication state - this would come from Supabase in real implementation
  const isAuthenticated = false;

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Activities", path: "/activities" },
    { label: "How It Works", path: "/how-it-works" }
  ];

  const authenticatedNavItems = [
    { label: "Profile", path: "/profile" },
    { label: "Matches", path: "/matches" },
    { label: "My Activities", path: "/activity-management" }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center py-4 md:py-6">
          <Link to="/" className="flex items-center space-x-2 z-10" onClick={closeMenu}>
            <Heart className="h-6 w-6 text-[#6C5CE7]" />
            <span className="font-bold text-xl">MINIMI</span>
          </Link>

          {isMobile ? (
            <div className="flex items-center">
              <button
                onClick={toggleMenu}
                className="text-gray-700 hover:text-gray-900 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          ) : (
            <nav className="flex items-center space-x-1">
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors", 
                      isActive(item.path) ? "font-medium text-black" : "text-gray-500"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {isAuthenticated && authenticatedNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors", 
                      isActive(item.path) ? "font-medium text-black" : "text-gray-500"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              
              <div className="hidden md:flex items-center space-x-3">
                {isAuthenticated ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Sign out logic would go here
                      navigate("/");
                    }}
                  >
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/login")}
                    >
                      Sign In
                    </Button>
                    <Button onClick={() => navigate("/signup")}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobile && isMenuOpen && (
        <div className="md:hidden absolute top-[64px] left-0 right-0 bg-white border-b border-gray-200 z-20">
          <div className="flex flex-col p-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={cn(
                  "px-3 py-2.5 rounded-md text-base hover:bg-gray-100 transition-colors", 
                  isActive(item.path) ? "font-medium text-black" : "text-gray-500"
                )}
              >
                {item.label}
              </Link>
            ))}
            
            {isAuthenticated && authenticatedNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={cn(
                  "px-3 py-2.5 rounded-md text-base hover:bg-gray-100 transition-colors", 
                  isActive(item.path) ? "font-medium text-black" : "text-gray-500"
                )}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="pt-2 border-t border-gray-100">
              {isAuthenticated ? (
                <Button 
                  className="w-full mt-2" 
                  variant="outline"
                  onClick={() => {
                    closeMenu();
                    // Sign out logic would go here
                    navigate("/");
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      closeMenu();
                      navigate("/login");
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full mt-2"
                    onClick={() => {
                      closeMenu();
                      navigate("/signup");
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

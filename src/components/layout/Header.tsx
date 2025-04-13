import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Heart, Menu, X, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Activities", path: "/activities" },
    { label: "How It Works", path: "/how-it-works" }
  ];

  const authenticatedNavItems = [
    { label: "Profile", path: "/profile" },
    { label: "My Activities", path: "/my-activities" },
    { label: "Connections", path: "/matches" },
    { label: "Match History", path: "/match-history" },
    { label: "Organizer Portal", path: "/activity-management" }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    closeMenu();
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <UserCircle size={18} />
                        <span>{user?.user_metadata?.name || 'Account'}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/my-activities")}>
                        My Activities
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/matches")}>
                        Connections
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/match-history")}>
                        Match History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/activity-management")}>
                        Organizer Portal
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                  onClick={handleSignOut}
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

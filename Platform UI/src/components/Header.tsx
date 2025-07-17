import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Settings, Vote, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LogoutButton from "./LogoutButton";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/voter')}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              <Vote className="w-4 h-4 mr-2" />
              Vote
            </Button>
            
            {isAuthenticated && (
              <>
                <Button
                  onClick={() => navigate('/manager')}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Elections
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Welcome, {user?.username}
                  </span>
                  <LogoutButton />
                </div>
              </>
            )}
            
            {!isAuthenticated && (
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/register')}
                  variant="outline"
                >
                  <User className="w-4 h-4 mr-2" />
                  Register
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 
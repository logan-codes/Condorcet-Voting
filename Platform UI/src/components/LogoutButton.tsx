import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/');
  };

  return (
    <Button 
      onClick={handleLogout}
      variant="outline"
      className="text-red-600 border-red-300 hover:bg-red-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
};

export default LogoutButton; 
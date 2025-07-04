import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const ContactHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Digital Future Agents
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Button 
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Accueil
          </Button>
          <Button 
            variant="ghost"
            onClick={() => navigate('/services')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Services
          </Button>
          <Button 
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Connexion
          </Button>
        </nav>
      </div>
    </header>
  );
};
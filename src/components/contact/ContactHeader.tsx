import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logoImage from "@/assets/agentimpact-logo.png";

export const ContactHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src={logoImage} alt="AgentImpact.fr" className="w-8 h-8" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AgentImpact.fr
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Button 
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-primary hover:text-accent font-medium"
          >
            Accueil
          </Button>
          <Button 
            variant="ghost"
            onClick={() => navigate('/services')}
            className="text-primary hover:text-accent font-medium"
          >
            Services
          </Button>
          <Button 
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="text-primary hover:text-accent font-medium"
          >
            Connexion
          </Button>
        </nav>
      </div>
    </header>
  );
};
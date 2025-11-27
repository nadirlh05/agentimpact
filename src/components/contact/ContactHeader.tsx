import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export const ContactHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">
            AgentImpact.fr
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-4">
          <Button 
            variant="ghost"
            onClick={() => navigate('/')}
            className="hover:bg-accent/10 font-medium"
          >
            Accueil
          </Button>
          <Button 
            variant="ghost"
            onClick={() => navigate('/services')}
            className="hover:bg-accent/10 font-medium"
          >
            Services
          </Button>
          <Button 
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="hover:bg-accent/10 font-medium"
          >
            Connexion
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};


import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthProvider';
import TicketForm from '@/components/TicketForm';
import TicketManagement from '@/components/TicketManagement';

const Support = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Support & Assistance Technique
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Notre équipe d'experts en automatisation IA est là pour vous accompagner. 
          Créez un ticket de support pour obtenir une assistance personnalisée.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="create">Créer un Ticket</TabsTrigger>
          <TabsTrigger value="manage">Gérer les Tickets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-8">
          <TicketForm />
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 bg-card rounded-xl border">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">🟢</span>
              </div>
              <h3 className="font-semibold mb-2">Priorité Basse</h3>
              <p className="text-sm text-muted-foreground">Réponse sous 48h</p>
            </div>
            
            <div className="text-center p-6 bg-card rounded-xl border">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 text-xl">🟡</span>
              </div>
              <h3 className="font-semibold mb-2">Priorité Moyenne</h3>
              <p className="text-sm text-muted-foreground">Réponse sous 24h</p>
            </div>
            
            <div className="text-center p-6 bg-card rounded-xl border">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">🔴</span>
              </div>
              <h3 className="font-semibold mb-2">Priorité Urgente</h3>
              <p className="text-sm text-muted-foreground">Réponse sous 2h</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="manage">
          {user ? (
            <TicketManagement />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Veuillez vous connecter pour gérer vos tickets.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;

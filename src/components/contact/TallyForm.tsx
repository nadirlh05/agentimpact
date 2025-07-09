
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendlyWidget } from "@/components/calendly/CalendlyWidget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TallyForm = () => {
  // URL Tally directement intégrée
  const tallyUrl = "https://tally.so/embed/nGElqo";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Planifier ma consultation
        </CardTitle>
        <p className="text-gray-600">
          Choisissez votre méthode de planification préférée
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="calendly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendly">Calendly (Recommandé)</TabsTrigger>
            <TabsTrigger value="form">Formulaire</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendly" className="mt-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Réservez directement un créneau qui vous convient dans notre calendrier
              </p>
              <CalendlyWidget
                type="inline"
                url="https://calendly.com/nadir-lahyani11/30min"
                className="w-full"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="form" className="mt-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Remplissez ce formulaire et nous vous contacterons sous 24h
              </p>
              <div className="relative">
                <iframe
                  src={tallyUrl}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  title="Formulaire de consultation"
                  className="rounded-lg"
                  style={{ 
                    minHeight: '600px',
                    background: 'transparent'
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

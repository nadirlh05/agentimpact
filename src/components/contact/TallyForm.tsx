import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          Remplissez ce formulaire et nous vous contacterons sous 24h
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <iframe
            src={tallyUrl}
            width="100%"
            height="600"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Formulaire de consultation"
            className="rounded-b-lg"
            style={{ 
              minHeight: '600px',
              background: 'transparent'
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
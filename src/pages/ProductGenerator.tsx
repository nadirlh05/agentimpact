
import { useState } from "react";
import { ArrowLeft, Zap, Download, Copy, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GeneratorForm } from "@/components/GeneratorForm";
import { useToast } from "@/hooks/use-toast";

interface GeneratedDescription {
  id: string;
  productName: string;
  description: string;
  language: string;
  wordCount: number;
  style: string;
}

const ProductGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescriptions, setGeneratedDescriptions] = useState<GeneratedDescription[]>([]);

  const handleGenerate = async (formData: any) => {
    setIsGenerating(true);
    
    try {
      // Simulation de la génération (à remplacer par l'appel API réel)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDescription: GeneratedDescription = {
        id: Date.now().toString(),
        productName: formData.productName,
        description: `Voici une description générée pour ${formData.productName}. Cette description respecte le style ${formData.writingStyle} et contient environ ${formData.wordCount} mots. Elle est rédigée en ${formData.language} et ${formData.includeBenefits ? 'inclut' : 'n\'inclut pas'} les bénéfices produits.`,
        language: formData.language,
        wordCount: formData.wordCount,
        style: formData.writingStyle
      };
      
      setGeneratedDescriptions(prev => [newDescription, ...prev]);
      
      toast({
        title: "Description générée avec succès !",
        description: `Nouvelle description créée pour ${formData.productName}`,
      });
    } catch (error) {
      toast({
        title: "Erreur lors de la génération",
        description: "Une erreur est survenue lors de la génération de la description.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: "La description a été copiée dans le presse-papiers.",
      });
    } catch (error) {
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier la description.",
        variant: "destructive",
      });
    }
  };

  const exportDescriptions = () => {
    const csvContent = [
      "Nom du produit,Description,Langue,Nombre de mots,Style",
      ...generatedDescriptions.map(desc => 
        `"${desc.productName}","${desc.description}","${desc.language}","${desc.wordCount}","${desc.style}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'descriptions-produits.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Générateur de Descriptions
              </span>
            </div>
          </div>
          
          {generatedDescriptions.length > 0 && (
            <Button 
              onClick={exportDescriptions}
              className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter ({generatedDescriptions.length})
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de génération */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="w-5 h-5 text-blue-600" />
                  <span>Générateur IA</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GeneratorForm 
                  onGenerate={handleGenerate} 
                  isLoading={isGenerating}
                />
              </CardContent>
            </Card>
          </div>

          {/* Résultats générés */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Descriptions générées ({generatedDescriptions.length})
            </h2>
            
            {generatedDescriptions.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="text-center py-12">
                  <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Aucune description générée pour le moment.
                    <br />
                    Utilisez le formulaire pour créer votre première description !
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {generatedDescriptions.map((desc) => (
                  <Card key={desc.id} className="border-l-4 border-blue-600">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{desc.productName}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(desc.description)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>🌐 {desc.language}</span>
                        <span>📝 {desc.wordCount} mots</span>
                        <span>✨ {desc.style}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {desc.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGenerator;

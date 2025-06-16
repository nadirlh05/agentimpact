
import { useState } from "react";
import { ArrowLeft, Zap, Download, Copy, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GeneratorForm } from "@/components/GeneratorForm";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import UserProfile from "@/components/UserProfile";
import { useToast } from "@/hooks/use-toast";
import { AIService } from "@/services/aiService";
import { useAuth } from "@/contexts/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

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
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescriptions, setGeneratedDescriptions] = useState<GeneratedDescription[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [currentProject, setCurrentProject] = useState<{id: string, name: string} | null>(null);

  const createProject = async (projectName: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          description: `Projet créé pour générer des descriptions de produits`,
          user_id: user.id,
          status: 'En cours'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        toast({
          title: "Erreur",
          description: "Impossible de créer le projet.",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error creating project:', error);
      return null;
    }
  };

  const saveDescriptionToDatabase = async (description: GeneratedDescription, projectId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('generated_descriptions')
        .insert({
          project_id: projectId,
          user_id: user.id,
          product_name: description.productName,
          description: description.description,
          language: description.language,
          word_count: description.wordCount,
          writing_style: description.style,
          bold_words: [],
          include_benefits: true
        });

      if (error) {
        console.error('Error saving description:', error);
        toast({
          title: "Avertissement",
          description: "Description générée mais pas sauvegardée en base de données.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error saving description:', error);
    }
  };

  const handleGenerate = async (formData: any) => {
    if (!apiKey.trim()) {
      toast({
        title: "Clé API manquante",
        description: "Veuillez saisir votre clé API OpenRouter pour continuer.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour générer des descriptions.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const aiService = new AIService(apiKey);
      
      // Create or get current project
      let project = currentProject;
      if (!project) {
        const projectName = formData.bulkMode && formData.bulkProducts.length > 0 
          ? `Projet ${new Date().toLocaleDateString('fr-FR')}`
          : `Projet ${formData.productName}`;
        
        const createdProject = await createProject(projectName);
        if (createdProject) {
          project = { id: createdProject.id, name: createdProject.name };
          setCurrentProject(project);
        }
      }

      if (formData.bulkMode && formData.bulkProducts.length > 0) {
        // Génération en mode bulk
        const promises = formData.bulkProducts.map(async (productName: string) => {
          const response = await aiService.generateDescription({
            ...formData,
            productName
          });
          
          return {
            id: `${Date.now()}-${Math.random()}`,
            productName,
            description: response.description,
            language: formData.language,
            wordCount: formData.wordCount,
            style: formData.writingStyle
          };
        });

        const newDescriptions = await Promise.all(promises);
        
        // Save all descriptions to database
        if (project) {
          for (const desc of newDescriptions) {
            await saveDescriptionToDatabase(desc, project.id);
          }
        }
        
        setGeneratedDescriptions(prev => [...newDescriptions, ...prev]);
        
        toast({
          title: "Descriptions générées avec succès !",
          description: `${newDescriptions.length} descriptions créées${project ? ' et sauvegardées' : ''}`,
        });
      } else {
        // Génération simple
        const response = await aiService.generateDescription(formData);
        
        const newDescription: GeneratedDescription = {
          id: Date.now().toString(),
          productName: formData.productName,
          description: response.description,
          language: formData.language,
          wordCount: formData.wordCount,
          style: formData.writingStyle
        };
        
        // Save to database
        if (project) {
          await saveDescriptionToDatabase(newDescription, project.id);
        }
        
        setGeneratedDescriptions(prev => [newDescription, ...prev]);
        
        toast({
          title: "Description générée avec succès !",
          description: `Nouvelle description créée pour ${formData.productName}${project ? ' et sauvegardée' : ''}`,
        });
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast({
        title: "Erreur lors de la génération",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la génération de la description.",
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
          
          <div className="flex items-center space-x-4">
            <UserProfile />
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {currentProject && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              <strong>Projet actuel :</strong> {currentProject.name}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de génération */}
          <div>
            <ApiKeyInput 
              onApiKeyChange={setApiKey}
              hasValidKey={!!apiKey.trim()}
            />
            
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
                    Configurez votre clé API et utilisez le formulaire pour créer votre première description !
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

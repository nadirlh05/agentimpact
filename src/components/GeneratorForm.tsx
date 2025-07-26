
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Wand2, Plus, X } from "lucide-react";

interface GeneratorFormProps {
  onGenerate: (data: any) => void;
  isLoading: boolean;
}

export const GeneratorForm = ({ onGenerate, isLoading }: GeneratorFormProps) => {
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    language: "français",
    boldWords: [] as string[],
    wordCount: 100,
    includeBenefits: true,
    writingStyle: "professionnel",
    bulkMode: false,
    bulkProducts: [] as string[]
  });

  const [newBoldWord, setNewBoldWord] = useState("");
  const [newBulkProduct, setNewBulkProduct] = useState("");

  const languages = [
    { value: "français", label: "Français" },
    { value: "anglais", label: "Anglais" },
    { value: "espagnol", label: "Espagnol" },
    { value: "allemand", label: "Allemand" },
    { value: "italien", label: "Italien" }
  ];

  const writingStyles = [
    { value: "professionnel", label: "Professionnel" },
    { value: "créatif", label: "Créatif" },
    { value: "technique", label: "Technique" },
    { value: "commercial", label: "Commercial" },
    { value: "décontracté", label: "Décontracté" }
  ];

  const wordCounts = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

  const addBoldWord = () => {
    if (newBoldWord.trim() && !formData.boldWords.includes(newBoldWord.trim())) {
      setFormData(prev => ({
        ...prev,
        boldWords: [...prev.boldWords, newBoldWord.trim()]
      }));
      setNewBoldWord("");
    }
  };

  const removeBoldWord = (word: string) => {
    setFormData(prev => ({
      ...prev,
      boldWords: prev.boldWords.filter(w => w !== word)
    }));
  };

  const addBulkProduct = () => {
    if (newBulkProduct.trim() && !formData.bulkProducts.includes(newBulkProduct.trim())) {
      setFormData(prev => ({
        ...prev,
        bulkProducts: [...prev.bulkProducts, newBulkProduct.trim()]
      }));
      setNewBulkProduct("");
    }
  };

  const removeBulkProduct = (product: string) => {
    setFormData(prev => ({
      ...prev,
      bulkProducts: prev.bulkProducts.filter(p => p !== product)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.bulkMode) {
      // Génération en mode bulk
      formData.bulkProducts.forEach(product => {
        onGenerate({
          ...formData,
          productName: product
        });
      });
    } else {
      // Génération simple
      onGenerate(formData);
    }
  };

  const isFormValid = formData.bulkMode 
    ? formData.bulkProducts.length > 0 
    : formData.productName.trim() !== "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode Bulk */}
      <div className="flex items-center justify-between">
        <Label htmlFor="bulk-mode" className="text-base font-medium">
          Mode génération en lot
        </Label>
        <Switch
          id="bulk-mode"
          checked={formData.bulkMode}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, bulkMode: checked }))}
        />
      </div>

      <Separator />

      {/* Produit(s) */}
      {formData.bulkMode ? (
        <div className="space-y-3">
          <Label className="text-base font-medium">Produits (mode lot)</Label>
          <div className="flex space-x-2">
            <Input
              placeholder="Nom du produit"
              value={newBulkProduct}
              onChange={(e) => setNewBulkProduct(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBulkProduct())}
            />
            <Button type="button" onClick={addBulkProduct} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.bulkProducts.map((product) => (
              <Badge key={product} variant="secondary" className="flex items-center space-x-1">
                <span>{product}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeBulkProduct(product)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="product-name" className="text-base font-medium">
            Nom du produit
          </Label>
          <Input
            id="product-name"
            placeholder="Ex: iPhone 15 Pro Max"
            value={formData.productName}
            onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
            required={!formData.bulkMode}
          />
        </div>
      )}

      {/* Description du produit */}
      <div className="space-y-2">
        <Label htmlFor="product-description" className="text-base font-medium">
          Description du produit (optionnel)
        </Label>
        <Textarea
          id="product-description"
          placeholder="Informations complémentaires sur le produit..."
          value={formData.productDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, productDescription: e.target.value }))}
          rows={3}
        />
      </div>

      <Separator />

      {/* Options de génération */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Langue */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Langue</Label>
          <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nombre de mots */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Nombre de mots</Label>
          <Select 
            value={formData.wordCount.toString()} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, wordCount: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {wordCounts.map((count) => (
                <SelectItem key={count} value={count.toString()}>
                  {count} mots
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Style d'écriture */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Style d'écriture</Label>
        <RadioGroup
          value={formData.writingStyle}
          onValueChange={(value) => setFormData(prev => ({ ...prev, writingStyle: value }))}
          className="grid grid-cols-2 gap-4"
        >
          {writingStyles.map((style) => (
            <div key={style.value} className="flex items-center space-x-2">
              <RadioGroupItem value={style.value} id={style.value} />
              <Label htmlFor={style.value} className="cursor-pointer">
                {style.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Mots en gras */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Mots à mettre en gras</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Mot clé"
            value={newBoldWord}
            onChange={(e) => setNewBoldWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBoldWord())}
          />
          <Button type="button" onClick={addBoldWord} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.boldWords.map((word) => (
            <Badge key={word} variant="outline" className="flex items-center space-x-1">
              <span className="font-bold">{word}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => removeBoldWord(word)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Inclure les bénéfices */}
      <div className="flex items-center justify-between">
        <Label htmlFor="include-benefits" className="text-base font-medium">
          Inclure les bénéfices produits
        </Label>
        <Switch
          id="include-benefits"
          checked={formData.includeBenefits}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeBenefits: checked }))}
        />
      </div>

      <Separator />

      {/* Bouton de génération */}
      <Button
        type="submit"
        disabled={!isFormValid || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
        size="lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Génération en cours...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5 mr-2" />
            {formData.bulkMode 
              ? `Générer ${formData.bulkProducts.length} descriptions`
              : "Générer la description"
            }
          </>
        )}
      </Button>
    </form>
  );
};

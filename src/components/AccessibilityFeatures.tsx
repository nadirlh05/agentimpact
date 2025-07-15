import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accessibility, Plus, Minus, Type, Contrast } from 'lucide-react';

const AccessibilityFeatures = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedContrast = localStorage.getItem('accessibility-contrast');
    
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
      document.documentElement.style.fontSize = `${parseInt(savedFontSize)}%`;
    }
    
    if (savedContrast === 'true') {
      setHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 10, 150);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem('accessibility-font-size', newSize.toString());
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 10, 80);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}%`;
    localStorage.setItem('accessibility-font-size', newSize.toString());
  };

  const resetFontSize = () => {
    setFontSize(100);
    document.documentElement.style.fontSize = '100%';
    localStorage.setItem('accessibility-font-size', '100');
  };

  const toggleContrast = () => {
    const newContrast = !highContrast;
    setHighContrast(newContrast);
    
    if (newContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    localStorage.setItem('accessibility-contrast', newContrast.toString());
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 rounded-full w-12 h-12 shadow-lg"
        aria-label="Options d'accessibilité"
        title="Options d'accessibilité"
      >
        <Accessibility className="w-5 h-5" />
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <Card className="fixed left-20 top-1/2 -translate-y-1/2 z-50 w-64 shadow-xl">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Accessibilité
            </h3>
            
            <div className="space-y-4">
              {/* Font Size Controls */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Taille du texte
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseFontSize}
                    aria-label="Diminuer la taille du texte"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-sm px-2">{fontSize}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseFontSize}
                    aria-label="Augmenter la taille du texte"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFontSize}
                  className="w-full mt-2"
                >
                  Réinitialiser
                </Button>
              </div>

              <Separator />

              {/* High Contrast */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Contrast className="w-4 h-4" />
                  Contraste élevé
                </h4>
                <Button
                  variant={highContrast ? "default" : "outline"}
                  size="sm"
                  onClick={toggleContrast}
                  className="w-full"
                >
                  {highContrast ? 'Désactiver' : 'Activer'}
                </Button>
              </div>

              <Separator />

              {/* Close Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AccessibilityFeatures;
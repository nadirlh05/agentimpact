import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Wifi, WifiOff, RefreshCw, Trash2 } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export const PWAStatusBar: React.FC = () => {
  const { 
    showInstallPrompt, 
    hideInstallPrompt, 
    isInstallable, 
    isInstalled 
  } = usePWAInstall();
  
  const {
    isOnline,
    pendingSync,
    isSyncing,
    retrySync,
    clearPendingData,
    hasPendingActions,
  } = useOfflineSync();

  // Ne pas afficher si pas d'actions nécessaires
  if (!isInstallable && isOnline && !hasPendingActions) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              État de l'app
            </CardTitle>
            <div className="flex items-center gap-2">
              {isInstalled && (
                <Badge variant="secondary">Installée</Badge>
              )}
              {!isOnline && (
                <Badge variant="destructive">Hors ligne</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Installation PWA */}
          {isInstallable && !isInstalled && (
            <div className="space-y-2">
              <CardDescription>
                Installez l'application pour une meilleure expérience
              </CardDescription>
              <div className="flex gap-2">
                <Button 
                  onClick={showInstallPrompt}
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Installer
                </Button>
                <Button 
                  onClick={hideInstallPrompt}
                  variant="outline"
                  size="sm"
                >
                  Plus tard
                </Button>
              </div>
            </div>
          )}

          {/* État de synchronisation */}
          {hasPendingActions && (
            <div className="space-y-2">
              <CardDescription>
                {pendingSync.length} action(s) en attente de synchronisation
              </CardDescription>
              <div className="flex gap-2">
                <Button 
                  onClick={retrySync}
                  disabled={!isOnline || isSyncing}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sync...' : 'Synchroniser'}
                </Button>
                <Button 
                  onClick={clearPendingData}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Statut hors ligne sans actions en attente */}
          {!isOnline && !hasPendingActions && (
            <CardDescription className="text-center">
              Mode hors ligne activé. Vos actions seront sauvegardées.
            </CardDescription>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
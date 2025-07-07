import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineData {
  id: string;
  timestamp: number;
  type: 'ticket' | 'lead' | 'contact';
  data: any;
  endpoint: string;
  method: string;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<OfflineData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Détecter les changements de connectivité
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connexion rétablie",
        description: "Synchronisation des données en cours...",
      });
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Mode hors ligne",
        description: "Vos données seront synchronisées à la reconnexion.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Charger les données en attente au démarrage
  useEffect(() => {
    loadPendingData();
  }, []);

  const loadPendingData = useCallback(() => {
    const stored = localStorage.getItem('offline-pending-data');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setPendingSync(data);
      } catch (error) {
        console.error('Erreur lors du chargement des données hors ligne:', error);
      }
    }
  }, []);

  const savePendingData = useCallback((data: OfflineData[]) => {
    localStorage.setItem('offline-pending-data', JSON.stringify(data));
    setPendingSync(data);
  }, []);

  // Ajouter une action hors ligne
  const addOfflineAction = useCallback((action: Omit<OfflineData, 'id' | 'timestamp'>) => {
    const newAction: OfflineData = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    const updatedPending = [...pendingSync, newAction];
    savePendingData(updatedPending);

    toast({
      title: "Action sauvegardée",
      description: "Cette action sera exécutée à la reconnexion.",
    });
  }, [pendingSync, savePendingData, toast]);

  // Synchroniser les données hors ligne
  const syncOfflineData = useCallback(async () => {
    if (!isOnline || pendingSync.length === 0 || isSyncing) return;

    setIsSyncing(true);
    let successCount = 0;
    let errorCount = 0;

    const remainingActions: OfflineData[] = [];

    for (const action of pendingSync) {
      try {
        const response = await fetch(action.endpoint, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action.data),
        });

        if (response.ok) {
          successCount++;
        } else {
          remainingActions.push(action);
          errorCount++;
        }
      } catch (error) {
        remainingActions.push(action);
        errorCount++;
      }
    }

    // Mettre à jour les actions en attente
    savePendingData(remainingActions);

    setIsSyncing(false);

    // Notifier les résultats
    if (successCount > 0) {
      toast({
        title: "Synchronisation réussie",
        description: `${successCount} action(s) synchronisée(s) avec succès.`,
      });
    }

    if (errorCount > 0) {
      toast({
        title: "Erreurs de synchronisation",
        description: `${errorCount} action(s) n'ont pas pu être synchronisées.`,
        variant: "destructive",
      });
    }
  }, [isOnline, pendingSync, isSyncing, savePendingData, toast]);

  // Nettoyer manuellement les données en attente
  const clearPendingData = useCallback(() => {
    savePendingData([]);
    toast({
      title: "Données nettoyées",
      description: "Toutes les actions en attente ont été supprimées.",
    });
  }, [savePendingData, toast]);

  // Retry manuel de la synchronisation
  const retrySync = useCallback(() => {
    if (isOnline) {
      syncOfflineData();
    } else {
      toast({
        title: "Pas de connexion",
        description: "Impossible de synchroniser sans connexion internet.",
        variant: "destructive",
      });
    }
  }, [isOnline, syncOfflineData, toast]);

  return {
    isOnline,
    pendingSync,
    isSyncing,
    addOfflineAction,
    syncOfflineData,
    clearPendingData,
    retrySync,
    hasPendingActions: pendingSync.length > 0,
  };
};
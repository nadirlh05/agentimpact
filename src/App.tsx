
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import Index from "./pages/Index";
import ProductGenerator from "./pages/ProductGenerator";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Projets from "./pages/Projets";
import Credits from "./pages/Credits";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {!user ? (
        // Routes pour utilisateurs non connectés
        <>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          {/* Redirection vers auth pour toutes les routes protégées */}
          <Route path="/generator" element={<Navigate to="/auth" replace />} />
          <Route path="/projets" element={<Navigate to="/auth" replace />} />
          <Route path="/credits" element={<Navigate to="/auth" replace />} />
          <Route path="/faq" element={<Navigate to="/auth" replace />} />
          <Route path="/support" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<NotFound />} />
        </>
      ) : (
        // Routes pour utilisateurs connectés avec layout authentifié
        <>
          <Route path="/" element={<Navigate to="/projets" replace />} />
          <Route path="/projets" element={
            <AuthenticatedLayout>
              <Projets />
            </AuthenticatedLayout>
          } />
          <Route path="/generator" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ProductGenerator />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/credits" element={
            <AuthenticatedLayout>
              <Credits />
            </AuthenticatedLayout>
          } />
          <Route path="/faq" element={
            <AuthenticatedLayout>
              <FAQ />
            </AuthenticatedLayout>
          } />
          <Route path="/support" element={
            <AuthenticatedLayout>
              <Support />
            </AuthenticatedLayout>
          } />
          <Route path="/auth" element={
            <AuthenticatedLayout>
              <Projets />
            </AuthenticatedLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </>
      )}
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import CRMDashboard from "@/components/CRMDashboard";
import Index from "./pages/Index";
import ProductGenerator from "./pages/ProductGenerator";
import OfferConfigurator from "./pages/OfferConfigurator";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminTickets from "./pages/AdminTickets";
import AdminUsers from "./pages/AdminUsers";
import Credits from "./pages/Credits";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();

  return (
    <Routes>
      {!user ? (
        // Routes pour utilisateurs non connectés
        <>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/support" element={<Support />} />
          <Route path="/faq" element={<FAQ />} />
          {/* Redirection vers auth pour toutes les routes protégées */}
          <Route path="/generator" element={<Navigate to="/auth" replace />} />
          <Route path="/configurator" element={<Navigate to="/auth" replace />} />
          <Route path="/projets" element={<Navigate to="/auth" replace />} />
          <Route path="/credits" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<NotFound />} />
        </>
      ) : (
        // Routes pour utilisateurs connectés avec layout authentifié
        <>
          <Route path="/" element={<Navigate to={isAdmin ? "/admin/dashboard" : "/projets"} replace />} />
          <Route path="/projets" element={
            <AuthenticatedLayout>
              <ClientDashboard />
            </AuthenticatedLayout>
          } />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AuthenticatedLayout>
                <AdminDashboard />
              </AuthenticatedLayout>
            </AdminRoute>
          } />
          <Route path="/admin/tickets" element={
            <AdminRoute>
              <AuthenticatedLayout>
                <AdminTickets />
              </AuthenticatedLayout>
            </AdminRoute>
          } />
          <Route path="/admin/tickets/:ticketId" element={
            <AdminRoute>
              <AuthenticatedLayout>
                <div>Détail du ticket à venir</div>
              </AuthenticatedLayout>
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AuthenticatedLayout>
                <AdminUsers />
              </AuthenticatedLayout>
            </AdminRoute>
          } />
          <Route path="/admin/crm" element={
            <AdminRoute>
              <AuthenticatedLayout>
                <CRMDashboard />
              </AuthenticatedLayout>
            </AdminRoute>
          } />
          <Route path="/generator" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ProductGenerator />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } />
          <Route path="/configurator" element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <OfferConfigurator />
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
              <ClientDashboard />
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


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
import { lazy, Suspense } from "react";
import { PWAStatusBar } from "@/components/PWAStatusBar";
import ErrorBoundary from "@/components/ErrorBoundary";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import { usePageTracking } from "@/hooks/usePageTracking";

// Lazy loading des pages pour améliorer les performances
const Index = lazy(() => import("./pages/Index"));
const ProductGenerator = lazy(() => import("./pages/ProductGenerator"));
const OfferConfigurator = lazy(() => import("./pages/OfferConfigurator"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const AdminTickets = lazy(() => import("./pages/AdminTickets"));
const AdminTicketDetail = lazy(() => import("./pages/AdminTicketDetail"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const Credits = lazy(() => import("./pages/Credits"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Support = lazy(() => import("./pages/Support"));
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminCalendly = lazy(() => import("./pages/AdminCalendly"));

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408, 429
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Improved loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="text-muted-foreground">Chargement de la page...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRole();
  
  // Use page tracking hook
  usePageTracking();

  if (loading) {
    return <LoadingFallback />;
  }

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
                <AdminTicketDetail />
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
          <Route path="/admin/analytics" element={
            <AdminRoute>
              <AuthenticatedLayout>
                <AdminAnalytics />
              </AuthenticatedLayout>
            </AdminRoute>
          } />
          <Route path="/admin/calendly" element={
            <AdminRoute>
              <AuthenticatedLayout>
                <AdminCalendly />
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
          <Route path="/contact" element={
            <AuthenticatedLayout>
              <Contact />
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
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <AppContent />
              <PWAStatusBar />
              <PerformanceMonitor />
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

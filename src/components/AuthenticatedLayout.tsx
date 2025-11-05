
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ThemeToggle } from './ThemeToggle';


interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b px-6 bg-card/50 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1 p-2 hover:bg-muted rounded-lg transition-colors" />
            <div className="flex-1">
              <div className="flex items-center justify-between space-x-4">
                <div>
                  <h1 className="text-xl font-bold text-foreground">AgentImpact.fr</h1>
                  <p className="text-sm text-muted-foreground">Plateforme d'automatisation IA</p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
      
    </SidebarProvider>
  );
};

export default AuthenticatedLayout;


import { Home, Plus, CreditCard, HelpCircle, MessageSquare, Bot, BarChart3, Settings, Sliders } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';

const mainMenuItems = [
  {
    title: "Tableau de bord",
    url: "/projets",
    icon: BarChart3,
    description: "Vue d'ensemble de vos projets"
  },
  {
    title: "Générateur IA",
    url: "/generator",
    icon: Bot,
    description: "Créer des contenus automatiquement"
  },
  {
    title: "Configurateur d'Offres",
    url: "/configurator",
    icon: Sliders,
    description: "Personnaliser vos solutions IA"
  },
];

const businessMenuItems = [
  {
    title: "Mes projets",
    url: "/projets",
    icon: Home,
  },
  {
    title: "Solutions & Tarifs",
    url: "/credits",
    icon: CreditCard,
  },
];

const supportMenuItems = [
  {
    title: "Centre d'aide",
    url: "/faq",
    icon: HelpCircle,
  },
  {
    title: "Support technique",
    url: "/support",
    icon: MessageSquare,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sidebar side="left" className="border-r bg-card">
      <SidebarHeader className="p-6 border-b bg-gradient-primary">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="text-white">
            <div className="font-bold text-lg">Digital Future</div>
            <div className="text-sm text-white/80">Agents IA</div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Outils IA
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.url)}
                    isActive={location.pathname === item.url}
                    className="w-full justify-start h-12 rounded-lg transition-all duration-200 hover:shadow-soft group"
                  >
                    <item.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Gestion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {businessMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.url)}
                    isActive={location.pathname === item.url}
                    className="w-full justify-start h-10 rounded-lg transition-all duration-200"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {supportMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.url)}
                    isActive={location.pathname === item.url}
                    className="w-full justify-start h-10 rounded-lg transition-all duration-200"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}

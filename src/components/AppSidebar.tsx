
import React from "react";
import { useAnalytics } from "@/lib/analytics";
import { Home, Plus, CreditCard, HelpCircle, MessageSquare, Bot, BarChart3, Settings, Sliders, Users, TicketIcon, Crown, Shield, TrendingUp, Calendar } from 'lucide-react';
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
import { useUserRole } from '@/hooks/useUserRole';
import UserProfile from './UserProfile';

const clientMenuItems = [
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

const adminMenuItems = [
  {
    title: "Tableau de bord Admin",
    url: "/admin/dashboard",
    icon: Shield,
    description: "Vue d'ensemble administration"
  },
  {
    title: "Gestion Tickets",
    url: "/admin/tickets",
    icon: TicketIcon,
    description: "Support client"
  },
  {
    title: "Gestion Utilisateurs",
    url: "/admin/users",
    icon: Users,
    description: "Rôles et permissions"
  },
  {
    title: "CRM",
    url: "/admin/crm",
    icon: BarChart3,
    description: "Leads et opportunités"
  },
  {
    title: "Analytics",
    url: "/admin/analytics", 
    icon: TrendingUp,
    description: "Statistiques et monitoring"
  },
  {
    title: "Calendly",
    url: "/admin/calendly",
    icon: Calendar,
    description: "Gestion des consultations"
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
  const { isAdmin, isClient } = useUserRole();
  const { trackUserAction } = useAnalytics();

  return (
    <Sidebar side="left" className="border-r bg-card">
      <SidebarHeader className="p-6 border-b bg-gradient-primary">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="text-white">
            <div className="font-bold text-lg">AgentImpact.fr</div>
            <div className="text-sm text-white/80">Solutions IA</div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4 space-y-6">
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center space-x-2">
              <Crown className="w-3 h-3" />
              <span>Administration</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => {
                        navigate(item.url);
                        trackUserAction('navigation', { page: item.title, type: 'admin' });
                      }}
                      isActive={location.pathname === item.url}
                      className="w-full justify-start h-12 rounded-lg transition-all duration-200 hover:shadow-soft group"
                    >
                      <item.icon className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
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
        )}

        {isClient && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Outils IA
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {clientMenuItems.map((item) => (
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
        )}

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

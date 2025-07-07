import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Types
type Ticket = Tables<'support_tickets'>;
type Lead = Tables<'leads_prospects_ia'>;
type Opportunity = Tables<'opportunities_ia'>;
type Company = Tables<'companies'>;

// Query Keys - centralisés pour éviter les doublons
export const queryKeys = {
  tickets: ['tickets'] as const,
  ticket: (id: string) => ['tickets', id] as const,
  leads: ['leads'] as const,
  lead: (id: string) => ['leads', id] as const,
  opportunities: ['opportunities'] as const,
  opportunity: (id: string) => ['opportunities', id] as const,
  companies: ['companies'] as const,
  company: (id: string) => ['companies', id] as const,
  userStats: ['userStats'] as const,
  adminStats: ['adminStats'] as const,
} as const;

// Hook pour les tickets
export const useTickets = () => {
  return useQuery({
    queryKey: queryKeys.tickets,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useTicket = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.ticket(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('ID requis');
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

// Hook pour les leads
export const useLeads = () => {
  return useQuery({
    queryKey: queryKeys.leads,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads_prospects_ia')
        .select(`
          *,
          companies (
            id,
            name,
            industry
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook pour les opportunités
export const useOpportunities = () => {
  return useQuery({
    queryKey: queryKeys.opportunities,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities_ia')
        .select(`
          *,
          companies (
            id,
            name,
            industry
          ),
          leads_prospects_ia (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook pour les entreprises
export const useCompanies = () => {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook pour les statistiques admin
export const useAdminStats = () => {
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: async () => {
      // Requêtes parallèles pour les statistiques
      const [ticketsResult, leadsResult, opportunitiesResult, companiesResult] = await Promise.all([
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('leads_prospects_ia').select('*', { count: 'exact', head: true }),
        supabase.from('opportunities_ia').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalTickets: ticketsResult.count || 0,
        totalLeads: leadsResult.count || 0,
        totalOpportunities: opportunitiesResult.count || 0,
        totalCompanies: companiesResult.count || 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes pour les stats
  });
};

// Hook pour les statistiques utilisateur
export const useUserStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.userStats,
    queryFn: async () => {
      if (!userId) throw new Error('User ID requis');
      
      const [projectsResult, descriptionsResult] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('generated_descriptions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      ]);

      return {
        totalProjects: projectsResult.count || 0,
        totalDescriptions: descriptionsResult.count || 0,
      };
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes pour les stats
  });
};

// Mutations optimisées avec invalidation du cache
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ statut: status })
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: (_, { ticketId }) => {
      // Invalider les caches liés
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets });
      queryClient.invalidateQueries({ queryKey: queryKeys.ticket(ticketId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
    },
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leadData: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      position?: string;
      company_id?: string;
      lead_source?: string;
      status?: string;
      priority?: string;
      notes?: string;
      user_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('leads_prospects_ia')
        .insert(leadData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminStats });
    },
  });
};
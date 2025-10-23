import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'client';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch role from secure user_roles table
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          // Don't default to any role on error - force authentication
          setRole(null);
        } else {
          // Only accept valid roles
          const validRoles: UserRole[] = ['admin', 'client'];
          const userRole = data?.role as UserRole;
          
          if (validRoles.includes(userRole)) {
            setRole(userRole);
          } else {
            console.error('Invalid role detected:', data?.role);
            setRole(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isClient = role === 'client';

  return {
    role,
    isAdmin,
    isClient,
    loading
  };
};
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { optimizedAnalytics } from '@/lib/analytics-optimized';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        // Si c'est une récupération de mot de passe, ne pas rediriger automatiquement
        if (event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Enhanced auth tracking with optimized analytics
        if (session?.user) {
          optimizedAnalytics.setUserId(session.user.id);
          optimizedAnalytics.track('user_signin', {
            method: event === 'SIGNED_IN' ? 'email' : 'oauth',
            user_id: session.user.id,
            email: session.user.email,
            provider: session.user.app_metadata?.provider || 'email',
            is_new_user: false
          });
        } else if (event === 'SIGNED_OUT') {
          optimizedAnalytics.track('user_signout', {
            session_duration: Date.now() - (session?.expires_at ? new Date(session.expires_at).getTime() : Date.now())
          });
          optimizedAnalytics.clearUserId();
        }
      }
    );

    // Check for existing session with error handling
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error getting session:', error);
          optimizedAnalytics.trackError(new Error(error.message), {
            context: 'auth_session_retrieval'
          });
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to get session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const startTime = Date.now();
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || email
          }
        }
      });
      
      // Track signup attempt
      optimizedAnalytics.track('signup_attempt', {
        success: !error,
        duration: Date.now() - startTime,
        error_message: error?.message
      });
      
      return { error };
    } catch (error) {
      optimizedAnalytics.trackError(error as Error, {
        context: 'signup',
        duration: Date.now() - startTime
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Track signin attempt
      optimizedAnalytics.track('signin_attempt', {
        success: !error,
        duration: Date.now() - startTime,
        method: 'email',
        error_message: error?.message
      });
      
      return { error };
    } catch (error) {
      optimizedAnalytics.trackError(error as Error, {
        context: 'signin',
        duration: Date.now() - startTime
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      optimizedAnalytics.track('signin_attempt', {
        success: !error,
        duration: Date.now() - startTime,
        method: 'google',
        error_message: error?.message
      });
      
      return { error };
    } catch (error) {
      optimizedAnalytics.trackError(error as Error, {
        context: 'google_signin',
        duration: Date.now() - startTime
      });
      return { error };
    }
  };

  const signOut = async () => {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        window.location.href = '/';
      }
      
      optimizedAnalytics.track('signout_attempt', {
        success: !error,
        duration: Date.now() - startTime
      });
      
      return { error };
    } catch (error) {
      optimizedAnalytics.trackError(error as Error, {
        context: 'signout',
        duration: Date.now() - startTime
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    const startTime = Date.now();
    const redirectUrl = `${window.location.origin}/auth?type=recovery`;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      optimizedAnalytics.track('password_reset_request', {
        success: !error,
        duration: Date.now() - startTime,
        error_message: error?.message
      });
      
      return { error };
    } catch (error) {
      optimizedAnalytics.trackError(error as Error, {
        context: 'password_reset',
        duration: Date.now() - startTime
      });
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      optimizedAnalytics.track('password_update', {
        success: !error,
        duration: Date.now() - startTime,
        error_message: error?.message
      });
      
      return { error };
    } catch (error) {
      optimizedAnalytics.trackError(error as Error, {
        context: 'password_update',
        duration: Date.now() - startTime
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

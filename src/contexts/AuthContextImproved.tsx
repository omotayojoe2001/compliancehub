import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  forceLogout: () => Promise<void>; // New force logout method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const ensureUserRecords = async (authUser: User) => {
    const metadata = authUser.user_metadata || {};
    const businessName = metadata.business_name || metadata.businessName;
    const phone = metadata.phone;
    const address = metadata.address || '';

    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!profileError && !existingProfile && (businessName || phone)) {
        await supabase.from('user_profiles').insert({
          id: authUser.id,
          business_name: businessName || null,
          phone: phone || null,
          address: address || null
        });
      }

      const { data: existingCompany, error: companyError } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (!companyError && !existingCompany && businessName) {
        await supabase.from('company_profiles').insert({
          user_id: authUser.id,
          company_name: businessName,
          address: address || null,
          phone: phone || null,
          is_primary: true
        });
      }
    } catch (error) {
      console.error('Error ensuring user records:', error);
    }
  };

  useEffect(() => {
    // Get initial session without waiting
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session:', !!session?.user);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, !!session?.user);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          await ensureUserRecords(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://compliance.forecourtlimited.com/confirm-email',
        data: metadata
      }
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    console.log('🚪 Regular logout attempt');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('🚪 Logout error:', error);
        // If regular logout fails, try force logout
        await forceLogout();
      } else {
        console.log('🚪 Logout successful');
        setUser(null);
        window.location.href = '/';
      }
    } catch (err) {
      console.error('🚪 Logout catch error:', err);
      await forceLogout();
    }
  };

  const forceLogout = async () => {
    console.log('🚪 Force logout attempt');
    try {
      // Clear Supabase session
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear all local storage
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      );
      supabaseKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Clear state
      setUser(null);
      
      // Force redirect
      window.location.href = '/';
    } catch (error) {
      console.error('🚪 Force logout error:', error);
      // Last resort - just clear everything and redirect
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      forceLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
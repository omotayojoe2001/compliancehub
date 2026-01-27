import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      console.log('🔐 Initializing auth...');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Session error:', error);
        setUser(null);
        setSession(null);
      } else {
        console.log('✅ Session loaded:', session?.user?.email || 'No session');
        setUser(session?.user ?? null);
        setSession(session);
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('❌ Session refresh error:', error);
      } else {
        setUser(session?.user ?? null);
        setSession(session);
      }
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    console.log('📝 Signing up:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  }, []);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔑 Signing in:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }, []);

  // Sign out - completely rewritten for reliability
  const signOut = useCallback(async () => {
    console.log('🚪 Starting sign out process...');

    try {
      setLoading(true);

      // Step 1: Clear local state immediately
      console.log('🚪 Step 1: Clearing local state');
      setUser(null);
      setSession(null);

      // Step 2: Clear browser storage
      console.log('🚪 Step 2: Clearing browser storage');
      localStorage.clear();
      sessionStorage.clear();

      // Step 3: Sign out from Supabase with timeout
      console.log('🚪 Step 3: Calling Supabase signOut');
      const signOutPromise = supabase.auth.signOut();

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('SignOut timeout')), 5000);
      });

      await Promise.race([signOutPromise, timeoutPromise]);
      console.log('🚪 Step 3: Supabase signOut completed');

    } catch (error) {
      console.warn('🚪 SignOut warning (continuing cleanup):', error);
      // Continue with cleanup even if Supabase signOut fails
    } finally {
      // Step 4: Force redirect regardless of Supabase result
      console.log('🚪 Step 4: Redirecting to login');
      setLoading(false);
      window.location.href = '/';
    }
  }, []);

  // Listen for auth changes
  useEffect(() => {
    console.log('🔄 Setting up auth listener');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email || 'No user');

        setUser(session?.user ?? null);
        setSession(session);
        setLoading(false);

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          console.log('🔄 User signed out');
          setUser(null);
          setSession(null);
        } else if (event === 'SIGNED_IN') {
          console.log('🔄 User signed in');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
        }
      }
    );

    // Initialize on mount
    initializeAuth();

    // Cleanup
    return () => {
      console.log('🔄 Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
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

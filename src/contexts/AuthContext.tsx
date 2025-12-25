import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ data: any, error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 AuthProvider initializing...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔐 Initial session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: error?.message
      });
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(err => {
      console.error('🔐 Session check failed:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          email: session?.user?.email
        });
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Create profile if user confirmed email but no profile exists
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureProfileExists(session.user.id, session.user.email!);
        }
      }
    )

    return () => {
      console.log('🔄 Auth cleanup')
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 SignIn attempt:', { email, timestamp: new Date().toISOString() })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('🔐 SignIn response:', {
        success: !error,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message
      })
      
      return { error }
    } catch (err) {
      console.error('🔐 SignIn catch error:', err)
      return { error: err }
    }
  }

  const signUp = async (email: string, password: string) => {
    console.log('📝 SignUp attempt:', {
      email,
      passwordLength: password?.length,
      timestamp: new Date().toISOString()
    })
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            email_confirm: false
          }
        }
      })
      
      console.log('📝 SignUp response:', {
        success: !error,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userConfirmed: data?.user?.email_confirmed_at,
        error: error?.message,
        errorCode: error?.status
      })
      
      if (error) {
        console.error('📝 SignUp error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
      }
      
      return { data, error }
    } catch (err) {
      console.error('📝 SignUp catch error:', err)
      return { data: null, error: err }
    }
  }

  const signOut = async () => {
    console.log('🚪 SignOut attempt');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      console.log('🚪 SignOut result:', {
        success: !error,
        error: error?.message
      });
      
      if (!error) {
        // Clear state immediately
        setUser(null);
        setSession(null);
        
        // Redirect to landing page
        window.location.href = '/';
      }
    } catch (err) {
      console.error('🚪 SignOut error:', err);
    }
  }

  // Ensure profile exists for authenticated user
  const ensureProfileExists = async (userId: string, email: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingProfile) {
        console.log('👤 Creating missing profile for user:', userId);
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            plan: 'basic',
            subscription_status: 'inactive'
          });

        if (error) {
          console.error('❌ Failed to create profile:', error);
        } else {
          console.log('✅ Profile created successfully');
        }
      }
    } catch (error) {
      console.error('❌ Error ensuring profile exists:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
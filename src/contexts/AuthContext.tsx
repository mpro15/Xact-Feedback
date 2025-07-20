import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Define AuthContext type
interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUser: (updates: any) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure isOnboarded is loaded from Supabase user metadata
  useEffect(() => {
    let listener: any;
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        // Fetch user profile from users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        setSession(data.session);
        setUser({ ...data.session.user, ...profile });
        localStorage.setItem('sb-user', JSON.stringify({ ...data.session.user, ...profile }));
      } else {
        setSession(null);
        setUser(null);
        localStorage.removeItem('sb-user');
      }
      setLoading(false);
    };
    getSession();
    listener = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Fetch user profile from users table
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setSession(session);
            setUser({ ...session.user, ...profile });
            localStorage.setItem('sb-user', JSON.stringify({ ...session.user, ...profile }));
          });
      } else {
        setSession(null);
        setUser(null);
        localStorage.removeItem('sb-user');
      }
    });
    return () => {
      listener?.data?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    console.log("Attempting login with:", { email, password });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    console.log("Login response:", { data, error });
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    setSession(data.session);
    setUser(data.user);
    localStorage.setItem('sb-user', JSON.stringify(data.user));
    setLoading(false);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    localStorage.removeItem('sb-user');
  };

  // Add updateUser to allow updating user state from onboarding
  const updateUser = (updates: any) => {
    setUser((prev: any) => ({ ...prev, ...updates }));
    localStorage.setItem('sb-user', JSON.stringify({ ...user, ...updates }));
  };

  const value: AuthContextType & { updateUser: (updates: any) => void } = {
    user,
    session,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
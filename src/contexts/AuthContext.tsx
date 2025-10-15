// filepath: c:\Users\Administrator\Documents\Xact-Feedback\src\contexts\AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Define User interface
interface User {
  id: string;
  email: string;
  name?: string;
  company_id?: string;
  role?: string;
  is_onboarded?: boolean;
  account_type?: 'admin' | 'user';
  is_approved?: boolean;
  permissions?: Record<string, boolean>;
}

// Define AuthContext interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, companyName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  companyId: string | null;
  setTestMode: (testMode: boolean) => void;
}

// Create the auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map account_type
function mapAccountType(type: any): 'admin' | 'user' | undefined {
  if (type === 'admin' || type === 'user') return type;
  return undefined;
}

// Provider component that wraps app and makes auth available
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [testMode, setTestMode] = useState<boolean>(false);
  const [realUser, setRealUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Create a mock admin user with all permissions
  const mockUser: User = {
    id: 'e6773f31-fd71-4866-bc56-46edccc80731',
    email: 'admin@example.com',
    name: 'Admin User',
    company_id: '39343f4d-f7b2-480b-8108-0ab995ae809b',
    role: 'admin',
    is_onboarded: true,
    account_type: mapAccountType('admin'),
    is_approved: true,
    permissions: {
      can_manage_users: true,
      can_access_analytics: true,
      can_send_feedback: true,
      can_view_reports: true
    }
  };

  // On mount, fetch real user from Supabase (if not in test mode)
  useEffect(() => {
    if (!testMode) {
      setLoading(true);
      supabase.auth.getUser()
        .then(({ data, error }) => {
          if (error || !data?.user) {
            setRealUser(null);
            setCompanyId(null);
          } else {
            // Map Supabase user to our User type
            const user = {
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.user_metadata?.name || '',
              company_id: data.user.user_metadata?.company_id || '',
              role: data.user.user_metadata?.role || '',
              is_onboarded: data.user.user_metadata?.is_onboarded || false,
              account_type: mapAccountType(data.user.user_metadata?.account_type),
              is_approved: data.user.user_metadata?.is_approved || false,
              permissions: data.user.user_metadata?.permissions || {},
            };
            setRealUser(user);
            setCompanyId(user.company_id ? user.company_id : null);
          }
          setLoading(false);
        });
    }
  }, [testMode]);

  // Use mock user if testMode, else use real user
  const user = testMode ? mockUser : realUser;

  const login = async (email: string, password: string): Promise<boolean> => {
    if (testMode) {
      return true;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) {
      setError(error?.message || 'Login failed');
      setLoading(false);
      return false;
    }
    // Map Supabase user to our User type
    const user = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || '',
      company_id: data.user.user_metadata?.company_id || '',
      role: data.user.user_metadata?.role || '',
      is_onboarded: data.user.user_metadata?.is_onboarded || false,
      account_type: mapAccountType(data.user.user_metadata?.account_type),
      is_approved: data.user.user_metadata?.is_approved || false,
      permissions: data.user.user_metadata?.permissions || {},
    };
    setRealUser(user);
    setCompanyId(user.company_id ? user.company_id : null);
    setLoading(false);
    return true;
  };

  const signup = async (email: string, password: string, name: string, companyName?: string): Promise<boolean> => {
    if (testMode) {
      return true;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company_id: companyName || '',
          role: 'admin',
          is_onboarded: false,
          account_type: mapAccountType('admin'),
          is_approved: false,
          permissions: {
            can_manage_users: true,
            can_access_analytics: true,
            can_send_feedback: true,
            can_view_reports: true
          }
        }
      }
    });
    if (error || !data?.user) {
      setError(error?.message || 'Signup failed');
      setLoading(false);
      return false;
    }
    // Map Supabase user to our User type
    const user = {
      id: data.user.id,
      email: data.user.email || '',
      name: name,
      company_id: companyName || '',
      role: 'admin',
      is_onboarded: false,
      account_type: mapAccountType('admin'),
      is_approved: false,
      permissions: {
        can_manage_users: true,
        can_access_analytics: true,
        can_send_feedback: true,
        can_view_reports: true
      }
    };
    setRealUser(user);
    setCompanyId(user.company_id ? user.company_id : null);
    setLoading(false);
    return true;
  };

  const logout = async (): Promise<void> => {
    if (testMode) {
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
    }
    setRealUser(null);
    setCompanyId(null);
    setLoading(false);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (testMode) {
      return true;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    setLoading(false);
    return true;
  };

  // Provide auth context value
  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    companyId: companyId ? companyId : null,
    setTestMode // Expose setter for test mode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for easy access to the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

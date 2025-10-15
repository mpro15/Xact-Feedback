// Backend-verified authentication service
import { supabase } from '../lib/supabaseClient';

export interface BackendAuthUser {
  id: string;
  email: string;
  name?: string;
  company_id?: string;
  role?: string;
  is_onboarded?: boolean;
  account_type?: 'admin' | 'user';
  is_approved?: boolean;
  permissions?: {
    can_manage_users: boolean;
    can_access_analytics: boolean;
    can_send_feedback: boolean;
    can_view_reports: boolean;
  };
}

export interface BackendAuthResponse {
  success: boolean;
  user?: BackendAuthUser;
  company?: {
    id: string;
    name: string;
    domain?: string;
    subscription_plan?: string;
    subscription_active: boolean;
  };
  session?: {
    expires_at: number;
    issued_at: number;
    token_type: string;
  };
  error?: string;
}

export class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login with email and password - backend verified
   */
  async login(email: string, password: string): Promise<BackendAuthResponse> {
    try {
      // First, authenticate with Supabase to get the JWT token
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return {
          success: false,
          error: authError.message
        };
      }

      if (!authData.session?.access_token) {
        return {
          success: false,
          error: 'No access token received'
        };
      }

      // Store the access token for future requests
      this.accessToken = authData.session.access_token;

      // Now verify the authentication with our backend
      const verificationResponse = await this.verifyAuthentication(authData.session.access_token);

      if (!verificationResponse.success) {
        // Clear the client session if backend verification fails
        await supabase.auth.signOut();
        this.accessToken = null;
        return verificationResponse;
      }

      return verificationResponse;

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  /**
   * Verify authentication token with backend
   */
  async verifyAuthentication(token?: string): Promise<BackendAuthResponse> {
    try {
      const authToken = token || this.accessToken;
      
      if (!authToken) {
        return {
          success: false,
          error: 'No authentication token available'
        };
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        return {
          success: false,
          error: errorData.error || `Authentication verification failed (${response.status})`
        };
      }

      const data = await response.json();
      return {
        success: true,
        user: data.user,
        company: data.company,
        session: data.session
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Backend verification failed'
      };
    }
  }

  /**
   * Check if current session is valid (backend verification)
   */
  async checkSession(): Promise<BackendAuthResponse> {
    try {
      // First check if there's a local session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.access_token) {
        return {
          success: false,
          error: 'No active session'
        };
      }

      // Verify with backend
      return await this.verifyAuthentication(sessionData.session.access_token);

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Session check failed'
      };
    }
  }

  /**
   * Signup with backend verification
   */
  async signup(email: string, password: string, name: string, companyName?: string): Promise<BackendAuthResponse> {
    try {
      console.log('Starting backend-verified signup process:', { email, name, companyName });
      
      // Validate inputs
      if (!email || !password || !name) {
        return {
          success: false,
          error: 'Email, password, and name are required'
        };
      }

      if (password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long'
        };
      }

      // Create auth user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: undefined // Disable email confirmation for development
        }
      });
      
      if (authError) {
        return {
          success: false,
          error: authError.message || 'Failed to create user account'
        };
      }
      
      if (!authData.user) {
        return {
          success: false,
          error: 'No user data returned from signup'
        };
      }

      console.log('Auth user created successfully:', authData.user.id);
      
      let company_id = null;
      let account_type = 'user';
      
      // If companyName is provided, create a new company (admin signup)
      if (companyName) {
        console.log('Creating company:', companyName);
        
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({ 
            name: companyName, 
            created_by: authData.user.id,
            subscription_active: false,
            subscription_plan: null 
          })
          .select()
          .single();
        
        if (companyError) {
          return {
            success: false,
            error: `Failed to create company: ${companyError.message}`
          };
        }
        
        company_id = companyData.id;
        account_type = 'admin';
        console.log('Company created successfully:', company_id);
      }
      
      // Create user profile
      console.log('Creating user profile');
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name,
          company_id,
          account_type,
          is_onboarded: false,
          is_approved: account_type === 'admin' // Admins are auto-approved
        });
      
      if (profileError) {
        return {
          success: false,
          error: `Failed to create user profile: ${profileError.message}`
        };
      }

      console.log('User profile created successfully');

      // If there's a session, verify it with backend
      if (authData.session?.access_token) {
        this.accessToken = authData.session.access_token;
        return await this.verifyAuthentication(authData.session.access_token);
      }

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name,
          company_id,
          account_type: account_type as 'admin' | 'user',
          is_onboarded: false,
          is_approved: account_type === 'admin'
        }
      };

    } catch (error: any) {
      console.error('Signup process failed:', error);
      return {
        success: false,
        error: error.message || 'Signup failed'
      };
    }
  }

  /**
   * Logout - clear both client and server sessions
   */
  async logout(): Promise<void> {
    try {
      // Clear local token
      this.accessToken = null;
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear local state
      this.accessToken = null;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Password reset failed'
      };
    }
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Create authenticated fetch wrapper for API requests
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.accessToken;
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    return fetch(url, {
      ...options,
      headers
    });
  }
}

export const authService = AuthService.getInstance();

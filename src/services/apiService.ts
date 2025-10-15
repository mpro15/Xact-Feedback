// Authenticated API service for backend-verified requests
import { authService } from './authService';

export class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL;
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Make an authenticated request to a Supabase Edge Function
   */
  async callEdgeFunction(functionName: string, data?: any, options: RequestInit = {}): Promise<Response> {
    const token = authService.getAccessToken();
    
    if (!token) {
      throw new Error('No authentication token available. Please log in.');
    }

    const url = `${this.baseUrl}/functions/v1/${functionName}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      ...options.headers
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
      body: data ? JSON.stringify(data) : options.body
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // If unauthorized, try to refresh authentication
      if (response.status === 401) {
        const authResult = await authService.checkSession();
        if (!authResult.success) {
          throw new Error('Authentication expired. Please log in again.');
        }
        
        // Retry with refreshed token
        const newHeaders = {
          ...headers,
          'Authorization': `Bearer ${authService.getAccessToken()}`
        };
        
        return fetch(url, {
          ...requestOptions,
          headers: newHeaders
        });
      }
      
      return response;
    } catch (error: any) {
      console.error(`Edge function ${functionName} call failed:`, error);
      throw error;
    }
  }

  /**
   * Make an authenticated Supabase REST API request
   */
  async callRestApi(table: string, operation: string, data?: any, filters?: Record<string, any>): Promise<any> {
    const token = authService.getAccessToken();
    
    if (!token) {
      throw new Error('No authentication token available. Please log in.');
    }

    let url = `${this.baseUrl}/rest/v1/${table}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Prefer': 'return=representation'
    };

    let method = 'GET';
    let body: string | undefined;

    // Build query parameters for filters
    if (filters && Object.keys(filters).length > 0) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.append(key, `in.(${value.join(',')})`);
        } else if (typeof value === 'string' && value.includes('*')) {
          params.append(key, `like.${value}`);
        } else {
          params.append(key, `eq.${value}`);
        }
      });
      url += `?${params.toString()}`;
    }

    switch (operation) {
      case 'select':
        method = 'GET';
        if (data && typeof data === 'string') {
          url += url.includes('?') ? `&select=${data}` : `?select=${data}`;
        }
        break;
      case 'insert':
        method = 'POST';
        body = JSON.stringify(data);
        break;
      case 'update':
        method = 'PATCH';
        body = JSON.stringify(data);
        break;
      case 'delete':
        method = 'DELETE';
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body
      });

      // If unauthorized, try to refresh authentication
      if (response.status === 401) {
        const authResult = await authService.checkSession();
        if (!authResult.success) {
          throw new Error('Authentication expired. Please log in again.');
        }
        
        // Retry with refreshed token
        const newHeaders = {
          ...headers,
          'Authorization': `Bearer ${authService.getAccessToken()}`
        };
        
        const retryResponse = await fetch(url, {
          method,
          headers: newHeaders,
          body
        });
        
        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.status} ${retryResponse.statusText}`);
        }
        
        return retryResponse.json();
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`API request failed: ${response.status} ${errorData.message || response.statusText}`);
      }

      // For delete operations, return success status
      if (method === 'DELETE') {
        return { success: true };
      }

      return response.json();
    } catch (error: any) {
      console.error(`REST API ${operation} on ${table} failed:`, error);
      throw error;
    }
  }

  /**
   * Convenience methods for common operations
   */
  
  async get(table: string, filters?: Record<string, any>, select?: string): Promise<any> {
    return this.callRestApi(table, 'select', select, filters);
  }

  async post(table: string, data: any): Promise<any> {
    return this.callRestApi(table, 'insert', data);
  }

  async patch(table: string, data: any, filters: Record<string, any>): Promise<any> {
    return this.callRestApi(table, 'update', data, filters);
  }

  async delete(table: string, filters: Record<string, any>): Promise<any> {
    return this.callRestApi(table, 'delete', undefined, filters);
  }

  /**
   * Verify current authentication status with backend
   */
  async verifyAuth(): Promise<boolean> {
    try {
      const response = await this.callEdgeFunction('verify-auth', {}, { method: 'POST' });
      return response.ok;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return false;
    }
  }
  /**
   * Test authenticated connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string; user?: any; permissions?: any }> {
    try {
      const response = await this.callEdgeFunction('verify-auth', {}, { method: 'POST' });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          user: data.user,
          permissions: data.user?.permissions
        };
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Connection failed' }));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection test failed'
      };
    }
  }
}

export const apiService = ApiService.getInstance();

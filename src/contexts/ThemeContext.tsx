import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  logo: string | null;
  companyName: string;
  updateTheme: (updates: Partial<ThemeContextType>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeContextType>({
    primaryColor: '#2563EB',
    secondaryColor: '#059669',
    logo: null,
    companyName: 'Xact Feedback',
    updateTheme: () => {}
  });

  // Memoize updateTheme to ensure stable reference
  const updateTheme = useCallback((updates: Partial<ThemeContextType>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Load company theme settings on initial load
  useEffect(() => {
    async function loadCompanyTheme() {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!user || userError) {
          console.log('User not authenticated or error fetching user');
          return;
        }
        
        // Get user's company ID
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();
          
        if (profileError || !profile?.company_id) {
          console.log('Error fetching user profile or no company ID');
          return;
        }
        
        // Fetch company data
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('name, logo_url, primary_color, secondary_color')
          .eq('id', profile.company_id)
          .single();
          
        if (companyError || !company) {
          console.log('Error fetching company data');
          return;
        }
        
        // Update theme with company settings
        setTheme(prev => ({
          ...prev,
          primaryColor: company.primary_color || '#2563EB',
          secondaryColor: company.secondary_color || '#059669',
          logo: company.logo_url,
          companyName: company.name
        }));
      } catch (error) {
        console.error('Error loading company theme:', error);
      }
    }
    
    loadCompanyTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ ...theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
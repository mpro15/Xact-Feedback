import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const updateTheme = (updates: Partial<ThemeContextType>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  return (
    <ThemeContext.Provider value={{ ...theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
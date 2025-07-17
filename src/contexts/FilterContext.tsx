import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FilterState {
  candidates: {
    status: string;
    stage: string;
    dateRange: string;
    position: string;
    searchTerm: string;
  };
  analytics: {
    dateRange: string;
    metric: string;
  };
}

interface FilterContextType {
  filters: FilterState;
  updateCandidateFilters: (filters: Partial<FilterState['candidates']>) => void;
  updateAnalyticsFilters: (filters: Partial<FilterState['analytics']>) => void;
  clearFilters: () => void;
}

const defaultFilters: FilterState = {
  candidates: {
    status: '',
    stage: '',
    dateRange: '',
    position: '',
    searchTerm: ''
  },
  analytics: {
    dateRange: 'last-30-days',
    metric: 'all'
  }
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(() => {
    // Load filters from localStorage on initialization
    const savedFilters = localStorage.getItem('xact-feedback-filters');
    return savedFilters ? JSON.parse(savedFilters) : defaultFilters;
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('xact-feedback-filters', JSON.stringify(filters));
  }, [filters]);

  const updateCandidateFilters = (newFilters: Partial<FilterState['candidates']>) => {
    setFilters(prev => ({
      ...prev,
      candidates: { ...prev.candidates, ...newFilters }
    }));
  };

  const updateAnalyticsFilters = (newFilters: Partial<FilterState['analytics']>) => {
    setFilters(prev => ({
      ...prev,
      analytics: { ...prev.analytics, ...newFilters }
    }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    localStorage.removeItem('xact-feedback-filters');
  };

  return (
    <FilterContext.Provider value={{
      filters,
      updateCandidateFilters,
      updateAnalyticsFilters,
      clearFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
};
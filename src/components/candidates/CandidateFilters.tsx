import React from 'react';
import { Calendar, X } from 'lucide-react';
import { useFilters } from '../../contexts/FilterContext';

export const CandidateFilters: React.FC = () => {
  const { filters, updateCandidateFilters, clearFilters } = useFilters();

  const statusOptions = ['All', 'Not Sent', 'Draft', 'Sent'];
  const stageOptions = ['All', 'Resume Screening', 'Phone Screen', 'Technical Interview', 'Final Interview'];
  const dateRangeOptions = ['All Time', 'Last 7 days', 'Last 30 days', 'Last 90 days'];

  const handleFilterChange = (key: string, value: string) => {
    updateCandidateFilters({ [key]: value });
  };

  const hasActiveFilters = Object.values(filters.candidates).some(value => value !== '');

  return (
    <div className="neumorphic-card p-4 border-t border-shadow/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select 
            value={filters.candidates.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="neumorphic-input w-full"
          >
            {statusOptions.map(option => (
              <option key={option} value={option === 'All' ? '' : option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Stage</label>
          <select 
            value={filters.candidates.stage}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
            className="neumorphic-input w-full"
          >
            {stageOptions.map(option => (
              <option key={option} value={option === 'All' ? '' : option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              value={filters.candidates.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="neumorphic-input w-full pl-10"
            >
              {dateRangeOptions.map(option => (
                <option key={option} value={option === 'All Time' ? '' : option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
          <input
            type="text"
            placeholder="Filter by position..."
            value={filters.candidates.position}
            onChange={(e) => handleFilterChange('position', e.target.value)}
            className="neumorphic-input w-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="neumorphic-btn text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Clear all filters</span>
          </button>
        )}
        <div className="text-sm text-gray-500">
          {hasActiveFilters ? 'Filters applied' : 'No filters applied'}
        </div>
      </div>
    </div>
  );
};
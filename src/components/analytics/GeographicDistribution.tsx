import React from 'react';
import { Globe, MapPin } from 'lucide-react';

export const GeographicDistribution: React.FC = () => {
  const regions = [
    { name: 'United States', candidates: 1247, percentage: 45.8, color: 'bg-blue-500' },
    { name: 'United Kingdom', candidates: 456, percentage: 16.7, color: 'bg-green-500' },
    { name: 'Canada', candidates: 234, percentage: 8.6, color: 'bg-purple-500' },
    { name: 'Australia', candidates: 189, percentage: 6.9, color: 'bg-orange-500' },
    { name: 'Germany', candidates: 156, percentage: 5.7, color: 'bg-pink-500' },
    { name: 'Other', candidates: 445, percentage: 16.3, color: 'bg-gray-500' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
          <p className="text-sm text-gray-600">Candidate feedback by location</p>
        </div>
        <Globe className="w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-4">
        {regions.map((region, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${region.color}`} />
              <span className="text-sm font-medium text-gray-900">{region.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{region.candidates.toLocaleString()}</span>
              <span className="text-sm font-medium text-gray-900 w-12 text-right">
                {region.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Candidates</span>
          <span className="font-medium text-gray-900">2,727</span>
        </div>
      </div>
    </div>
  );
};
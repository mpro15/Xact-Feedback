import React, { useState } from 'react';
import { X, Download, Filter, Calendar, Search } from 'lucide-react';

interface MetricDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export const MetricDataModal: React.FC<MetricDataModalProps> = ({
  isOpen,
  onClose,
  title,
  value,
  change,
  trend
}) => {
  const [dateRange, setDateRange] = useState('last-30-days');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  if (!isOpen) return null;

  // Mock data based on metric type
  const generateMockData = () => {
    const baseData = [];
    for (let i = 0; i < 50; i++) {
      const candidate = {
        id: i + 1,
        name: `Candidate ${i + 1}`,
        email: `candidate${i + 1}@email.com`,
        position: ['Frontend Developer', 'Backend Developer', 'Product Manager', 'UX Designer'][i % 4],
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: ['Opened', 'Clicked', 'Enrolled', 'Bounced'][Math.floor(Math.random() * 4)],
        stage: ['Resume Screening', 'Phone Screen', 'Technical Interview', 'Final Interview'][i % 4]
      };
      baseData.push(candidate);
    }
    return baseData;
  };

  const data = generateMockData();

  const handleExport = () => {
    const csvContent = data.map(row => 
      `${row.name},${row.email},${row.position},${row.date},${row.status},${row.stage}`
    ).join('\n');
    
    const blob = new Blob([
      `Name,Email,Position,Date,Status,Stage\n${csvContent}`
    ], { type: 'text/csv' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="neumorphic-modal max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-shadow/20 bg-gradient-to-r from-background-light to-background">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title} Details</h2>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-3xl font-bold text-primary-600">{value}</span>
              <span className={`text-sm font-semibold neumorphic-badge ${
                trend === 'up' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
              }`}>
                {change} from last period
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neumorphic-btn p-3"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-shadow/20 bg-background-light">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 neumorphic-search px-4 py-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-6 w-full bg-transparent border-0 outline-none text-gray-700 placeholder-gray-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="neumorphic-input px-3 py-2 text-sm"
              >
                <option value="last-7-days">Last 7 days</option>
                <option value="last-30-days">Last 30 days</option>
                <option value="last-90-days">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="neumorphic-input px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="opened">Opened</option>
                <option value="clicked">Clicked</option>
                <option value="enrolled">Enrolled</option>
                <option value="bounced">Bounced</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              className="neumorphic-btn-primary px-4 py-2 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="neumorphic-table-header sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Stage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-shadow/20">
              {filteredData.map((item) => (
                <tr key={item.id} className="neumorphic-table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {item.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`neumorphic-badge text-xs font-semibold ${
                      item.status === 'Opened' ? 'bg-green-100 text-green-800' :
                      item.status === 'Clicked' ? 'bg-primary-100 text-primary-800' :
                      item.status === 'Enrolled' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {item.stage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-shadow/20 bg-background-light">
          <div className="text-sm font-medium text-gray-700">
            Showing {filteredData.length} of {data.length} records
          </div>
          <div className="flex items-center space-x-2">
            <button className="neumorphic-btn px-3 py-2 text-sm">Previous</button>
            <button className="neumorphic-btn-primary px-3 py-2 text-sm">1</button>
            <button className="neumorphic-btn px-3 py-2 text-sm">2</button>
            <button className="neumorphic-btn px-3 py-2 text-sm">3</button>
            <button className="neumorphic-btn px-3 py-2 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
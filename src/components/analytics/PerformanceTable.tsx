import React from 'react';
import { ArrowUp, ArrowDown, Download, Filter } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const PerformanceTable: React.FC = () => {
  const { addNotification } = useNotification();
  
  const performanceData = [
    {
      stage: 'Resume Screening',
      candidates: 1247,
      feedbackSent: 892,
      openRate: 72.3,
      clickRate: 28.4,
      enrollmentRate: 12.1,
      reApplicationRate: 8.3,
      trend: 'up'
    },
    {
      stage: 'Phone Screen',
      candidates: 456,
      feedbackSent: 389,
      openRate: 68.9,
      clickRate: 31.2,
      enrollmentRate: 15.6,
      reApplicationRate: 12.4,
      trend: 'up'
    },
    {
      stage: 'Technical Interview',
      candidates: 234,
      feedbackSent: 198,
      openRate: 65.1,
      clickRate: 24.7,
      enrollmentRate: 18.3,
      reApplicationRate: 15.7,
      trend: 'down'
    },
    {
      stage: 'Final Interview',
      candidates: 89,
      feedbackSent: 76,
      openRate: 78.9,
      clickRate: 42.1,
      enrollmentRate: 26.7,
      reApplicationRate: 22.1,
      trend: 'up'
    }
  ];

  const handleRowClick = (stage: string) => {
    addNotification({
      type: 'info',
      title: 'Detailed View',
      message: `Opening detailed data for ${stage} stage`
    });
  };

  const handleExport = () => {
    const csvContent = performanceData.map(row => 
      `${row.stage},${row.candidates},${row.feedbackSent},${row.openRate},${row.clickRate},${row.enrollmentRate},${row.reApplicationRate}`
    ).join('\n');
    
    const blob = new Blob([
      `Stage,Candidates,Feedback Sent,Open Rate,Click Rate,Enrollment Rate,Re-application Rate\n${csvContent}`
    ], { type: 'text/csv' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance_by_stage.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Export Complete',
      message: 'Performance data has been exported successfully'
    });
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance by Rejection Stage</h3>
          <p className="text-sm text-gray-600 mt-1">Detailed metrics for each interview stage</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rejection Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feedback Sent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Open Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Click Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enrollment Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Re-application Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {performanceData.map((row, index) => (
              <tr 
                key={index} 
                onClick={() => handleRowClick(row.stage)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.stage}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.candidates.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.feedbackSent.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.openRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.clickRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.enrollmentRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.reApplicationRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.trend === 'up' ? (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
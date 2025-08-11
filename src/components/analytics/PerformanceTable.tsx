import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Download, Filter } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabaseClient';

interface PerformanceTableProps {
  chartData: any[];
}

export const PerformanceTable: React.FC<PerformanceTableProps> = ({ chartData }) => {
  const { addNotification } = useNotification();
  const [performanceData, setPerformanceData] = useState<any[]>(chartData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState<string | null>(null);

  useEffect(() => {
    if (chartData) {
      setPerformanceData(chartData);
    }
  }, [chartData]);

  useEffect(() => {
    async function fetchPerformanceData() {
      setLoading(true);
      setError(null);
      // Get current user and company
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();
      if (!profile?.company_id) {
        setError('No company found');
        setLoading(false);
        return;
      }
      // Fetch all candidates for aggregation
      const { data: candidates, error: candidateError } = await supabase
        .from('candidates')
        .select('*')
        .eq('company_id', profile.company_id);
      if (candidateError) {
        setError(candidateError.message);
        setLoading(false);
        return;
      }
      // Aggregate performance by rejection_stage
      const stageMap: Record<string, any> = {};
      candidates.forEach(c => {
        const stage = c.rejection_stage || 'Unknown';
        if (!stageMap[stage]) {
          stageMap[stage] = {
            stage,
            candidates: 0,
            feedbackSent: 0,
            openRate: 0,
            clickRate: 0,
            enrollmentRate: 0,
            reApplicationRate: 0,
          };
        }
        stageMap[stage].candidates++;
        if (c.feedback_status === 'sent') stageMap[stage].feedbackSent++;
        stageMap[stage].openRate += c.email_opens || 0;
        stageMap[stage].clickRate += c.email_clicks || 0;
        stageMap[stage].enrollmentRate += c.course_enrollments || 0;
        stageMap[stage].reApplicationRate += c.reapplied ? 1 : 0;
      });
      // Calculate averages
      const result = Object.values(stageMap).map(row => ({
        ...row,
        openRate: row.candidates ? (row.openRate / row.candidates) : 0,
        clickRate: row.candidates ? (row.clickRate / row.candidates) : 0,
        enrollmentRate: row.candidates ? (row.enrollmentRate / row.candidates) : 0,
        reApplicationRate: row.candidates ? (row.reApplicationRate / row.candidates) * 100 : 0,
        trend: row.feedbackSent > row.candidates / 2 ? 'up' : 'down',
      }));
      setPerformanceData(result);
      setLoading(false);
    }
    fetchPerformanceData();
  }, []);

  const handleRowClick = (stage: string) => {
    addNotification({
      type: 'info',
      title: 'Detailed View',
      message: `Opening detailed data for ${stage} stage`
    });
  };

  const handleExport = () => {
    const csvContent = performanceData.map(row => 
      `${row.rejection_stage},${row.candidates},${row.feedbackSent},${row.openRate},${row.clickRate},${row.enrollmentRate},${row.reApplicationRate}`
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

  const handleFilter = (stage: string) => {
    setFilterStage(stage);
    const filteredData = performanceData.filter(row => row.stage === stage);
    setPerformanceData(filteredData);
  };

  const displayedData = filterStage
    ? performanceData.filter(row => row.stage === filterStage)
    : performanceData;

  if (loading) return <div className="p-4">Loading performance data...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance by Rejection Stage</h3>
          <p className="text-sm text-gray-600 mt-1">Detailed metrics for each interview stage</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleFilter('Specific Stage')} // Replace 'Specific Stage' with the desired stage
            className="p-2 text-gray-500 hover:text-gray-700"
          >
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
            {displayedData.map((row, index) => (
              <tr 
                key={index} 
                onClick={() => handleRowClick(row.stage)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.rejection_stage}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.candidates ? row.candidates.toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.feedbackSent ? row.feedbackSent.toLocaleString() : 'N/A'}
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
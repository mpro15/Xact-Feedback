import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

interface TimeSeriesData {
  date: string;
  openRate: number;
  clickRate: number;
  reapplicationRate: number;
  totalSent: number;
}

export const TimeSeriesChart: React.FC = () => {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  // For custom date range selection
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 1))); // Default to 1 month ago
  const [endDate, setEndDate] = useState<Date>(new Date()); // Default to today

  useEffect(() => {
    fetchTimeSeriesData();
  }, [timeRange]);

  const fetchTimeSeriesData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current user and company
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        throw new Error('User not authenticated');
      }

      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        throw new Error('No company found');
      }

      // Calculate date range based on selected time range
      const rangeEnd = new Date();
      let rangeStart: Date;

      switch(timeRange) {
        case 'week':
          rangeStart = new Date();
          rangeStart.setDate(rangeStart.getDate() - 7);
          break;
        case 'month':
          rangeStart = new Date();
          rangeStart.setMonth(rangeStart.getMonth() - 1);
          break;
        case 'quarter':
          rangeStart = new Date();
          rangeStart.setMonth(rangeStart.getMonth() - 3);
          break;
        case 'year':
          rangeStart = new Date();
          rangeStart.setFullYear(rangeStart.getFullYear() - 1);
          break;
        default:
          rangeStart = new Date();
          rangeStart.setMonth(rangeStart.getMonth() - 1);
      }

      // Fetch candidate data within date range
      const { data: candidateData, error: dataError } = await supabase
        .from('candidates')
        .select('*')
        .eq('company_id', profile.company_id)
        .gte('created_at', rangeStart.toISOString())
        .lte('created_at', rangeEnd.toISOString())
        .order('created_at', { ascending: true });

      if (dataError) {
        throw dataError;
      }

      // Process data by date to calculate metrics
      const dateMap = new Map<string, {
        sent: number;
        opened: number;
        clicked: number;
        reapplied: number;
      }>();

      candidateData.forEach((candidate) => {
        // Format date to YYYY-MM-DD
        const date = new Date(candidate.created_at).toISOString().split('T')[0];
        
        if (!dateMap.has(date)) {
          dateMap.set(date, {
            sent: 0,
            opened: 0,
            clicked: 0,
            reapplied: 0,
          });
        }
        
        const current = dateMap.get(date)!;
        
        // Increment metrics
        current.sent++;
        
        if (candidate.email_opens > 0) {
          current.opened++;
        }
        
        if (candidate.email_clicks > 0) {
          current.clicked++;
        }
        
        if (candidate.reapplied) {
          current.reapplied++;
        }
      });

      // Convert map to array and calculate rates
      const formattedData = Array.from(dateMap.entries())
        .map(([date, metrics]) => {
          const openRate = metrics.sent > 0 ? (metrics.opened / metrics.sent) * 100 : 0;
          const clickRate = metrics.sent > 0 ? (metrics.clicked / metrics.sent) * 100 : 0;
          const reapplicationRate = metrics.sent > 0 ? (metrics.reapplied / metrics.sent) * 100 : 0;
          
          return {
            date,
            openRate,
            clickRate,
            reapplicationRate,
            totalSent: metrics.sent,
          };
        })
        .sort((a, b) => a.date.localeCompare(b.date));
        
      setTimeSeriesData(formattedData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching time series data:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = timeSeriesData.map(data => 
      `${data.date},${data.openRate.toFixed(2)},${data.clickRate.toFixed(2)},${data.reapplicationRate.toFixed(2)},${data.totalSent}`
    ).join('\n');
    
    const blob = new Blob([`Date,Open Rate (%),Click Rate (%),Reapplication Rate (%),Total Sent\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `engagement_metrics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return formatter.format(date);
  };

  const handleRefresh = () => {
    fetchTimeSeriesData();
  };

  if (loading) return (
    <div className="neumorphic-chart flex justify-center items-center" style={{ height: '400px' }}>
      <RefreshCw className="w-8 h-8 text-primary-400 animate-spin" />
    </div>
  );
  
  if (error) return (
    <div className="neumorphic-chart p-6 text-center" style={{ height: '400px' }}>
      <div className="text-red-500 mb-4">Error: {error}</div>
      <button 
        onClick={handleRefresh}
        className="neumorphic-btn px-4 py-2 text-primary-600 flex items-center space-x-2 mx-auto"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );

  return (
    <div className="neumorphic-chart">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Engagement Metrics Over Time</h3>
          <p className="text-sm text-gray-600">Open rates, click rates, and reapplication rates</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportData}
            className="neumorphic-btn p-2"
            title="Export data as CSV"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleRefresh}
            className="neumorphic-btn p-2"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Time Range Selection */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              timeRange === 'week' 
                ? 'bg-primary-100 text-primary-800 shadow-neumorphic-inset' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              timeRange === 'month' 
                ? 'bg-primary-100 text-primary-800 shadow-neumorphic-inset' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              timeRange === 'quarter' 
                ? 'bg-primary-100 text-primary-800 shadow-neumorphic-inset' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Quarter
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              timeRange === 'year' 
                ? 'bg-primary-100 text-primary-800 shadow-neumorphic-inset' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Year
          </button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            {timeRange === 'week' ? 'Last 7 days' :
             timeRange === 'month' ? 'Last 30 days' :
             timeRange === 'quarter' ? 'Last 90 days' : 'Last 365 days'}
          </span>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-8">
        {/* Line chart for rates */}
        <div className="neumorphic-world-map p-4" style={{ height: '400px' }}>
          <h4 className="text-lg font-medium text-gray-800 mb-4">Engagement Rates</h4>
          {timeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <LineChart
                data={timeSeriesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                  labelFormatter={(label) => formatDate(label as string)}
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '0.75rem'
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="openRate"
                  stroke="#10B981" // green-500
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10B981', stroke: '#10B981' }}
                  activeDot={{ r: 5, stroke: '#059669', strokeWidth: 2 }}
                  name="Open Rate"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="clickRate"
                  stroke="#3B82F6" // blue-500
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#3B82F6', stroke: '#3B82F6' }}
                  activeDot={{ r: 5, stroke: '#2563EB', strokeWidth: 2 }}
                  name="Click Rate"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="reapplicationRate"
                  stroke="#F59E0B" // amber-500
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#F59E0B', stroke: '#F59E0B' }}
                  activeDot={{ r: 5, stroke: '#D97706', strokeWidth: 2 }}
                  name="Reapplication Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data available for the selected time range
            </div>
          )}
        </div>

        {/* Area chart for sent emails */}
        <div className="neumorphic-world-map p-4" style={{ height: '300px' }}>
          <h4 className="text-lg font-medium text-gray-800 mb-4">Feedback Emails Sent</h4>
          {timeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart
                data={timeSeriesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Emails Sent']}
                  labelFormatter={(label) => formatDate(label as string)}
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '0.75rem'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="totalSent"
                  stroke="#4F46E5" // indigo-600
                  fill="url(#colorSent)"
                  name="Emails Sent"
                >
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data available for the selected time range
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="neumorphic-card p-4 flex items-center space-x-3">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-gray-800">Open Rate</p>
            <p className="text-xs text-gray-600">Percentage of emails opened</p>
          </div>
        </div>
        <div className="neumorphic-card p-4 flex items-center space-x-3">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-gray-800">Click Rate</p>
            <p className="text-xs text-gray-600">Percentage of emails with clicks</p>
          </div>
        </div>
        <div className="neumorphic-card p-4 flex items-center space-x-3">
          <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-gray-800">Reapplication Rate</p>
            <p className="text-xs text-gray-600">Percentage of candidates who reapplied</p>
          </div>
        </div>
      </div>
    </div>
  );
};

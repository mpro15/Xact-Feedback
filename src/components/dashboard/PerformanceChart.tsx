import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export const PerformanceChart: React.FC = () => {
  const [data, setData] = useState<{ month: string; feedbackSent: number; openRate: number }[]>([]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      const { data: performanceData, error } = await supabase
        .from('performance_metrics')
        .select('month, feedback_sent, open_rate');

      if (error) {
        console.error('Error fetching performance data:', error);
        setData([]);
      } else {
        setData(
          performanceData.map((item) => ({
            month: item.month,
            feedbackSent: item.feedback_sent || 0,
            openRate: item.open_rate || 0,
          }))
        );
      }
    };

    fetchPerformanceData();
  }, []);

  const maxFeedback = Math.max(...data.map((d) => d.feedbackSent), 0);
  const maxRate = Math.max(...data.map((d) => d.openRate), 0);

  return (
    <div className="neumorphic-chart">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Performance Overview</h3>
          <p className="text-sm text-gray-600">Email feedback and engagement metrics</p>
        </div>
        <div className="neumorphic-badge bg-primary-100 text-primary-800 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+12% this month</span>
        </div>
      </div>

      <div className="neumorphic-world-map mb-6">
        <div className="h-64 flex items-end justify-between space-x-3">
          {data.length > 0 ? (
            data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                {/* Feedback Sent Bar */}
                <div className="w-full flex justify-center">
                  <div className="w-8 bg-background rounded-lg shadow-neumorphic-inset overflow-hidden">
                    <div
                      className="neumorphic-chart-bar bg-gradient-to-t from-primary-500 to-primary-300 w-full transition-all duration-500 hover:from-primary-600 hover:to-primary-400"
                      style={{ height: `${(item.feedbackSent / maxFeedback) * 120}px` }}
                    />
                  </div>
                </div>

                {/* Open Rate Bar */}
                <div className="w-full flex justify-center">
                  <div className="w-8 bg-background rounded-lg shadow-neumorphic-inset overflow-hidden">
                    <div
                      className="neumorphic-chart-bar bg-gradient-to-t from-green-500 to-green-300 w-full transition-all duration-500 hover:from-green-600 hover:to-green-400"
                      style={{ height: `${(item.openRate / maxRate) * 80}px` }}
                    />
                  </div>
                </div>

                <span className="text-xs font-medium text-gray-700 mt-3">{item.month}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No data available</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center space-x-8">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gradient-to-r from-primary-500 to-primary-300 rounded-full shadow-neumorphic-sm" />
          <span className="text-sm font-medium text-gray-700">Feedback Sent</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-300 rounded-full shadow-neumorphic-sm" />
          <span className="text-sm font-medium text-gray-700">Open Rate %</span>
        </div>
      </div>
    </div>
  );
};
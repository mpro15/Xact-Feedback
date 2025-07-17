import React from 'react';
import { TrendingUp } from 'lucide-react';

export const PerformanceChart: React.FC = () => {
  const data = [
    { month: 'Jan', feedbackSent: 145, openRate: 65 },
    { month: 'Feb', feedbackSent: 167, openRate: 71 },
    { month: 'Mar', feedbackSent: 189, openRate: 68 },
    { month: 'Apr', feedbackSent: 201, openRate: 73 },
    { month: 'May', feedbackSent: 234, openRate: 69 },
    { month: 'Jun', feedbackSent: 267, openRate: 75 }
  ];

  const maxFeedback = Math.max(...data.map(d => d.feedbackSent));
  const maxRate = Math.max(...data.map(d => d.openRate));

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
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center space-y-2">
              {/* Feedback Sent Bar */}
              <div className="w-full flex justify-center">
                <div className="w-8 bg-background rounded-lg shadow-neumorphic-inset overflow-hidden">
                  <div
                    className="neumorphic-chart-bar bg-gradient-to-t from-primary-500 to-primary-300 w-full transition-all duration-500 hover:from-primary-600 hover:to-primary-400"
                    style={{ 
                      height: `${(item.feedbackSent / maxFeedback) * 120}px`,
                    }}
                  />
                </div>
              </div>
              
              {/* Open Rate Bar */}
              <div className="w-full flex justify-center">
                <div className="w-8 bg-background rounded-lg shadow-neumorphic-inset overflow-hidden">
                  <div
                    className="neumorphic-chart-bar bg-gradient-to-t from-green-500 to-green-300 w-full transition-all duration-500 hover:from-green-600 hover:to-green-400"
                    style={{ 
                      height: `${(item.openRate / maxRate) * 80}px`,
                    }}
                  />
                </div>
              </div>
              
              <span className="text-xs font-medium text-gray-700 mt-3">{item.month}</span>
            </div>
          ))}
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
import React from 'react';
import { Mail, Eye, MousePointer, UserCheck } from 'lucide-react';

export const EngagementChart: React.FC = () => {
  const data = [
    { month: 'Jan', sent: 145, opened: 98, clicked: 34, enrolled: 12 },
    { month: 'Feb', sent: 167, opened: 115, clicked: 41, enrolled: 18 },
    { month: 'Mar', sent: 189, opened: 128, clicked: 45, enrolled: 22 },
    { month: 'Apr', sent: 201, opened: 142, clicked: 52, enrolled: 28 },
    { month: 'May', sent: 234, opened: 161, clicked: 58, enrolled: 31 },
    { month: 'Jun', sent: 267, opened: 185, clicked: 67, enrolled: 39 }
  ];

  const maxValue = Math.max(...data.map(d => d.sent));

  return (
    <div className="neumorphic-chart">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Engagement Funnel</h3>
          <p className="text-sm text-gray-600">Email performance and conversion metrics</p>
        </div>
      </div>

      <div className="neumorphic-world-map mb-6">
        <div className="h-80 flex items-end justify-between space-x-4">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center space-y-3">
              {/* Sent */}
              <div className="w-full flex justify-center">
                <div className="w-10 bg-background rounded-lg shadow-neumorphic-inset overflow-hidden">
                  <div
                    className="neumorphic-chart-bar bg-gradient-to-t from-primary-600 to-primary-400 w-full"
                    style={{ 
                      height: `${(item.sent / maxValue) * 120}px`,
                    }}
                  />
                </div>
              </div>
              
              {/* Opened */}
              <div className="w-full flex justify-center">
                <div className="w-10 bg-background rounded-lg shadow-neumorphic-inset overflow-hidden">
                  <div
                    className="neumorphic-chart-bar bg-gradient-to-t from-green-500 to-green-400 w-full"
                    style={{ 
                      height: `${(item.opened / maxValue) * 120}px`,
                    }}
                  />
                </div>
              </div>
              
              {/* Clicked */}
              <div className="w-full flex justify-center">
                <div className="w-10 bg-background rounded-lg shadow-neumorphic-inset overflow-hidden">
                  <div
                    className="neumorphic-chart-bar bg-gradient-to-t from-blue-500 to-blue-400 w-full"
                    style={{ 
                      height: `${(item.clicked / maxValue) * 120}px`,
                    }}
                  />
                </div>
              </div>
              
              {/* Enrolled */}
              <div className="w-full flex justify-center">
                <div className="w-10 bg-background rounded-lg shadow-neumorphic-inset overflow-hidden">
                  <div
                    className="neumorphic-chart-bar bg-gradient-to-t from-orange-500 to-orange-400 w-full"
                    style={{ 
                      height: `${(item.enrolled / maxValue) * 120}px`,
                    }}
                  />
                </div>
              </div>
              
              <span className="text-sm font-medium text-gray-700 mt-3">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neumorphic-badge flex items-center space-x-2 justify-center py-2">
          <div className="w-4 h-4 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full shadow-neumorphic-sm" />
          <span className="text-sm font-medium text-gray-700">Emails Sent</span>
        </div>
        <div className="neumorphic-badge flex items-center space-x-2 justify-center py-2">
          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-400 rounded-full shadow-neumorphic-sm" />
          <span className="text-sm font-medium text-gray-700">Opened</span>
        </div>
        <div className="neumorphic-badge flex items-center space-x-2 justify-center py-2">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-neumorphic-sm" />
          <span className="text-sm font-medium text-gray-700">Clicked</span>
        </div>
        <div className="neumorphic-badge flex items-center space-x-2 justify-center py-2">
          <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-neumorphic-sm" />
          <span className="text-sm font-medium text-gray-700">Enrolled</span>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { TrendingUp, Mail, Eye, MousePointer, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { MetricCard } from '../../components/analytics/MetricCard';
import { EngagementChart } from '../../components/analytics/EngagementChart';
import { PerformanceTable } from '../../components/analytics/PerformanceTable';
import { WorldMap } from '../../components/analytics/WorldMap';

export const AnalyticsPage: React.FC = () => {
  const metrics = [
    {
      title: 'Email Open Rate',
      value: '67.3%',
      change: '+5.2%',
      trend: 'up' as const,
      icon: Eye,
      color: 'blue'
    },
    {
      title: 'Click-through Rate',
      value: '23.8%',
      change: '+2.1%',
      trend: 'up' as const,
      icon: MousePointer,
      color: 'green'
    },
    {
      title: 'Course Enrollments',
      value: '342',
      change: '+18%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Re-applications',
      value: '156',
      change: '+23%',
      trend: 'up' as const,
      icon: Users,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track feedback performance and candidate engagement metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EngagementChart />
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">89.2%</div>
                    <div className="text-sm text-gray-600">Delivery Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">34.5%</div>
                    <div className="text-sm text-gray-600">Avg. Open Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">12.8%</div>
                    <div className="text-sm text-gray-600">Click Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">8.3%</div>
                    <div className="text-sm text-gray-600">Enrollment Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <WorldMap />
      </div>

      {/* Performance Table */}
      <PerformanceTable />
    </div>
  );
};
import React from 'react';
import { Users, Mail, TrendingUp, UserMinus } from 'lucide-react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { RecentCandidates } from '../../components/dashboard/RecentCandidates';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { PerformanceChart } from '../../components/dashboard/PerformanceChart';

export const DashboardPage: React.FC = () => {
  const stats = [
    {
      title: 'Total Candidates',
      value: '2,847',
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Feedback Sent',
      value: '1,923',
      change: '+8%',
      trend: 'up' as const,
      icon: Mail,
      color: 'green'
    },
    {
      title: 'Email Open Rate',
      value: '67.3%',
      change: '+5.2%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Re-applications',
      value: '156',
      change: '+23%',
      trend: 'up' as const,
      icon: UserMinus,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your candidate feedback.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Recent Candidates */}
      <RecentCandidates />
    </div>
  );
};
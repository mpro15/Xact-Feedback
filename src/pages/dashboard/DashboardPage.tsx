import React, { useEffect, useState } from 'react';
import { Users, Mail, TrendingUp, UserMinus } from 'lucide-react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { RecentCandidates } from '../../components/dashboard/RecentCandidates';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { PerformanceChart } from '../../components/dashboard/PerformanceChart';
import { supabase } from '../../lib/supabaseClient';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState([
    {
      title: 'Total Candidates',
      value: 'Loading...',
      change: '',
      trend: 'up' as const,
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Feedback Sent',
      value: '1,923',
      change: '+8%',
      trend: 'up' as const,
      icon: Mail,
      color: 'green' as const
    },
    {
      title: 'Email Open Rate',
      value: '67.3%',
      change: '+5.2%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'purple' as const
    },
    {
      title: 'Re-applications',
      value: '156',
      change: '+23%',
      trend: 'up' as const,
      icon: UserMinus,
      color: 'orange' as const
    }
  ]);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (!profile?.company_id) return;

        const [candidatesCount, feedbackSentCount, openRateData, reapplicationsCount] = await Promise.all([
          supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', profile.company_id),
          supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', profile.company_id)
            .eq('feedback_status', 'sent'),
          supabase
            .from('candidates')
            .select('email_opens, email_clicks')
            .eq('company_id', profile.company_id),
          supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', profile.company_id)
            .eq('reapplied', true)
        ]);

        const totalCandidates = candidatesCount.count || 0;
        const feedbackSent = feedbackSentCount.count || 0;
        const openRate = openRateData?.data ? (openRateData.data.reduce((acc, curr) => acc + (curr.email_opens || 0), 0) / totalCandidates) : 0;
        const reapplications = reapplicationsCount.count || 0;

        setStats([
          {
            title: 'Total Candidates',
            value: totalCandidates.toString(),
            change: '',
            trend: 'up' as const,
            icon: Users,
            color: 'blue' as const
          },
          {
            title: 'Feedback Sent',
            value: feedbackSent.toString(),
            change: '',
            trend: 'up' as const,
            icon: Mail,
            color: 'green' as const
          },
          {
            title: 'Email Open Rate',
            value: `${(openRate * 100).toFixed(1)}%`,
            change: '',
            trend: 'up' as const,
            icon: TrendingUp,
            color: 'purple' as const
          },
          {
            title: 'Re-applications',
            value: reapplications.toString(),
            change: '',
            trend: 'up' as const,
            icon: UserMinus,
            color: 'orange' as const
          }
        ]);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    }

    fetchDashboardStats();
  }, []);

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
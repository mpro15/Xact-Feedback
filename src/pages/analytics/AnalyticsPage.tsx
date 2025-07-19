import React, { useEffect, useState } from 'react';
import { Mail, Eye, MousePointer, Users } from 'lucide-react';
import { MetricCard } from '../../components/analytics/MetricCard';
import { EngagementChart } from '../../components/analytics/EngagementChart';
import { PerformanceTable } from '../../components/analytics/PerformanceTable';
import { WorldMap } from '../../components/analytics/WorldMap';
import { supabase } from '../../lib/supabaseClient';

type FunnelType = Record<string, number>;

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalSent: 0,
    openRate: 0,
    clickRate: 0,
    funnel: {} as FunnelType,
  });

  useEffect(() => {
    async function fetchStats() {
      // Total sent
      const sentRes = await supabase.from('email_campaigns').select('id', { count: 'exact', head: true });
      const totalSent = sentRes.count || 0;
      // Open rate
      const openRes = await supabase.from('email_campaigns').select('id', { count: 'exact', head: true }).not('opened_at', 'is', null);
      const opened = openRes.count || 0;
      // Click rate
      const clickRes = await supabase.from('email_campaigns').select('id', { count: 'exact', head: true }).not('clicked_at', 'is', null);
      const clicked = clickRes.count || 0;
      // Funnel data
      const funnelRes = await supabase.from('candidates').select('rejection_stage');
      const funnel: FunnelType = {};
      if (funnelRes.data) {
        funnelRes.data.forEach((row: any) => {
          const stage = row.rejection_stage || 'Unknown';
          funnel[stage] = (funnel[stage] || 0) + 1;
        });
      }
      setStats({
        totalSent,
        openRate: totalSent ? (opened / totalSent) * 100 : 0,
        clickRate: totalSent ? (clicked / totalSent) * 100 : 0,
        funnel,
      });
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track feedback performance and candidate engagement metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Sent" value={stats.totalSent.toString()} icon={Mail} color="blue" change="" trend="up" />
        <MetricCard title="Open Rate" value={stats.openRate.toFixed(1) + '%'} icon={Eye} color="green" change="" trend="up" />
        <MetricCard title="Click Rate" value={stats.clickRate.toFixed(1) + '%'} icon={MousePointer} color="purple" change="" trend="up" />
        <MetricCard title="Candidates" value={Object.values(stats.funnel).reduce((a: number, b: number) => a + b, 0).toString()} icon={Users} color="orange" change="" trend="up" />
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
import React, { useEffect, useState } from 'react';
import { Mail, Eye, MousePointer, Users } from 'lucide-react';
import { MetricCard } from '../../components/analytics/MetricCard';
import { PerformanceTable } from '../../components/analytics/PerformanceTable';
import { WorldMap } from '../../components/analytics/WorldMap';
import { supabase } from '../../lib/supabaseClient';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalSent: 0,
    openCount: 0,
    clickCount: 0,
    openRate: 0,
    clickRate: 0,
    funnel: {} as Record<string, number>,
    chartData: [] as any[],
  });

  useEffect(() => {
    async function fetchStats() {
      // Total sent
      const sentRes = await supabase.from('email_campaigns').select('*', { count: 'exact', head: true });
      const totalSent = sentRes.count || 0;
      // Opened
      const openRes = await supabase.from('email_campaigns').select('*', { count: 'exact', head: true }).not('opened_at', 'is', null);
      const openCount = openRes.count || 0;
      // Clicked
      const clickRes = await supabase.from('email_campaigns').select('*', { count: 'exact', head: true }).not('clicked_at', 'is', null);
      const clickCount = clickRes.count || 0;
      // Funnel data
      const funnelRes = await supabase.from('candidates').select('rejection_stage');
      const funnel: Record<string, number> = {};
      if (funnelRes.data) {
        funnelRes.data.forEach((row: any) => {
          const stage = row.rejection_stage || 'Unknown';
          funnel[stage] = (funnel[stage] || 0) + 1;
        });
      }
      // Chart data: group by month
      // Replace with your actual monthly aggregation RPC or query
      const chartData = [
        { month: 'N/A', sent: totalSent, opened: openCount, clicked: clickCount }
      ];
      setStats({
        totalSent,
        openCount,
        clickCount,
        openRate: totalSent ? (openCount / totalSent) * 100 : 0,
        clickRate: totalSent ? (clickCount / totalSent) * 100 : 0,
        funnel,
        chartData,
      });
    }
    fetchStats();
  }, []);

  const candidateCount = Object.values(stats.funnel).reduce((a, b) => (a as number) + (b as number), 0);

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
        <MetricCard title="Candidates" value={candidateCount.toString()} icon={Users} color="orange" change="" trend="up" />
      </div>
      {/* Charts Grid */}
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Engagement Bar Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Engagement Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                  <Bar dataKey="opened" fill="#22c55e" name="Opened" />
                  <Bar dataKey="clicked" fill="#a855f7" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalSent}</div>
                    <div className="text-sm text-gray-600">Total Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.openRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Open Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.clickRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Click Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{candidateCount}</div>
                    <div className="text-sm text-gray-600">Candidates</div>
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
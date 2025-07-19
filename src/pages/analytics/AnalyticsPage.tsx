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
    opens: 0,
    clicks: 0,
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
      const openRes = await supabase.from('email_campaigns').select('id', { count: 'exact', head: true }).not('opened_at', 'is', null);
      const opens = openRes.count || 0;
      // Clicked
      const clickRes = await supabase.from('email_campaigns').select('id', { count: 'exact', head: true }).not('clicked_at', 'is', null);
      const clicks = clickRes.count || 0;
      // Funnel data: grouped count by rejection_stage
      const funnelRes = await supabase.from('candidates').select('rejection_stage');
      const funnel: Record<string, number> = {};
      if (funnelRes.data) {
        funnelRes.data.forEach((row: any) => {
          const stage = row.rejection_stage || 'Unknown';
          funnel[stage] = (funnel[stage] || 0) + 1;
        });
      }
      // Chart data for Recharts
      const chartData = Object.entries(funnel).map(([stage, count]) => ({ stage, count }));
      setStats({
        totalSent,
        opens,
        clicks,
        openRate: totalSent ? opens / totalSent : 0,
        clickRate: totalSent ? clicks / totalSent : 0,
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
        <MetricCard title="Open Rate" value={(stats.openRate * 100).toFixed(1) + '%'} icon={Eye} color="green" change="" trend="up" />
        <MetricCard title="Click Rate" value={(stats.clickRate * 100).toFixed(1) + '%'} icon={MousePointer} color="purple" change="" trend="up" />
        <MetricCard title="Candidates" value={candidateCount.toString()} icon={Users} color="orange" change="" trend="up" />
      </div>
      {/* Charts Grid */}
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Engagement Bar Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Rejection Stage Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.chartData}>
                  <XAxis dataKey="stage" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Candidates" />
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
                    <div className="text-2xl font-bold text-green-600">{(stats.openRate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Open Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{(stats.clickRate * 100).toFixed(1)}%</div>
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
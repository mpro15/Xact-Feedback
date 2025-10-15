import React, { useEffect, useState } from 'react';
import { Mail, Eye, MousePointer, Users } from 'lucide-react';
import { MetricCard } from '../../components/analytics/MetricCard';
import { PerformanceTable } from '../../components/analytics/PerformanceTable';
import { TimeSeriesChart } from '../../components/analytics/TimeSeriesChart';
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
import { Modal } from '../../components/ui/Modal.tsx';

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
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      // Total sent
      const sentRes = await supabase.from('email_campaigns').select('*', { count: 'exact', head: true });
      const totalSent = sentRes.count || 0;
      // Opened
      const openRes = await supabase.from('email_campaigns').select('*', { count: 'exact', head: true }).not('opened_at', 'is', null);
      const opens = openRes.count || 0;
      // Clicked
      const clickRes = await supabase.from('email_campaigns').select('*', { count: 'exact', head: true }).not('clicked_at', 'is', null);
      const clicks = clickRes.count || 0;
      // Fetch the profile data
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        console.error('User not authenticated');
        return;
      }
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) {
        console.error('No company ID found for the user');
        return;
      }
      // Funnel data: grouped count by rejection_stage
      const funnelRes = await supabase.from('candidates').select('country, city, rejection_stage').eq('company_id', profile.company_id);

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

  const handleBarClick = async (data: any) => {
    if (data && data.stage) {
      setSelectedStage(data.stage);
      setIsModalOpen(true);

      // Fetch candidates for the selected rejection stage
      const { data: candidateData, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('rejection_stage', data.stage);

      if (error) {
        console.error('Error fetching candidates:', error);
        setCandidates([]);
      } else {
        setCandidates(candidateData || []);
      }
    }
  };

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
                <BarChart
                  data={stats.chartData}
                  onClick={(e) => {
                    if (e && e.activeLabel) {
                      const clickedStage = stats.chartData.find((item) => item.stage === e.activeLabel);
                      if (clickedStage) handleBarClick(clickedStage);
                    }
                  }}
                >
                  <XAxis dataKey="stage" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="url(#colorUv)" name="Candidates">
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                  </Bar>
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
          </div>        </div>
        <TimeSeriesChart />
      </div>
      {/* Performance Table */}
      <PerformanceTable chartData={stats.chartData} />
      {/* Modal for showing candidates */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h3 className="text-lg font-semibold mb-4">Candidates in {selectedStage}</h3>
          {candidates.length > 0 ? (
            <ul className="space-y-2">
              {candidates.map((candidate) => (
                <li key={candidate.id} className="p-2 border rounded-md">
                  <div className="font-medium text-gray-900">{candidate.name}</div>
                  <div className="text-sm text-gray-600">{candidate.email}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No candidates found for this stage.</p>
          )}
        </Modal>
      )}
    </div>
  );
};
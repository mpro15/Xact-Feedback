import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabaseClient';

export const BillingPage: React.FC = () => {
  const { addNotification } = useNotification();
  const [credits, setCredits] = useState<number>(0);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const CREDIT_THRESHOLD = 100;

  useEffect(() => {
    async function fetchCredits() {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;
      if (!userId) return;
      const profileRes = await supabase.from('users').select('company_id').eq('id', userId).single();
      const companyId = profileRes.data?.company_id;
      if (!companyId) return;
      const creditsRes = await supabase.from('credits_balance').select('credits').eq('company_id', companyId).single();
      setCredits(creditsRes.data?.credits || 0);
      const usageRes = await supabase.from('credits_usage_log').select('*').eq('company_id', companyId).order('used_at', { ascending: false });
      setUsageHistory(usageRes.data || []);
    }
    fetchCredits();
  }, []);

  const handleTopUp = async () => {
    const res = await fetch('/functions/create_topup_session', { method: 'POST' });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      addNotification({ type: 'error', title: 'Top-Up Failed', message: 'Could not create payment session.' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Billing & Credits</h1>
        <p className="text-gray-600">Manage your subscription, credits, and billing information</p>
      </div>
      {credits < CREDIT_THRESHOLD && (
        <div className="neumorphic-card p-4 bg-yellow-50 border border-yellow-200 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <h4 className="font-medium text-yellow-900">Low Credit Balance</h4>
            <p className="text-sm text-yellow-800">You have {credits} credits remaining. Consider topping up to avoid service interruption.</p>
          </div>
        </div>
      )}
      <div className="neumorphic-card p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Current Credits</p>
          <p className="text-3xl font-bold text-green-600">{credits.toLocaleString()}</p>
        </div>
        <button className="neumorphic-btn-primary px-6 py-3 text-lg" onClick={handleTopUp}>Top-Up</button>
      </div>
      <div className="neumorphic-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Usage History</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Feature</th>
              <th>Description</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {usageHistory.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No usage history found.</td></tr>
            ) : (
              usageHistory.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td>{new Date(row.used_at).toLocaleString()}</td>
                  <td>{row.amount}</td>
                  <td>{row.feature}</td>
                  <td>{row.description}</td>
                  <td>{row.user_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
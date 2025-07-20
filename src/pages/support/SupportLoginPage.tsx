import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const SupportLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    // Fetch all companies for dropdown
    supabase.from('companies').select('id, name').then(({ data }) => {
      if (data) setCompanies(data);
    });
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Capture support agent login event
      const location = await fetch('https://ipapi.co/json/').then(res => res.json());
      await supabase.from('support_logins').insert({
        email,
        company_id: companyId,
        login_time: new Date().toISOString(),
        location: location.city + ', ' + location.country_name
      });
      // Set session as support agent for selected company (custom logic)
      // You may need to use a service role or custom JWT for this
      // For now, redirect to dashboard as admin
      navigate(`/dashboard?company=${companyId}&support=1`);
    } catch (e) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Support Agent Login</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Support Agent Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="agent@company.com"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
          <select
            value={companyId}
            onChange={e => setCompanyId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Choose a company</option>
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleLogin}
          disabled={isLoading || !email || !companyId}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner size="small" /> : 'Login as Support Agent'}
        </button>
        {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
      </div>
    </div>
  );
};

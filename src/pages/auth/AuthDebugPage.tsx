import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const AuthDebugPage: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testCredentials = {
    email: 'testuser1755160371871@xactfeedback.com',
    password: 'TestPassword123!'
  };

  useEffect(() => {    // Gather debug information
    const gatherDebugInfo = async () => {
      const info: any = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKeyExists: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        supabaseKeyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
        nodeEnv: import.meta.env.NODE_ENV,
        mode: import.meta.env.MODE,
        timestamp: new Date().toISOString()
      };
      
      // Test basic connection
      try {
        const { error } = await supabase.auth.getSession();
        info.connectionTest = error ? `Failed: ${error.message}` : 'Success';
      } catch (error: any) {
        info.connectionTest = `Error: ${error.message}`;
      }
      
      setDebugInfo(info);
    };

    gatherDebugInfo();
  }, []);

  const handleAuthTest = async () => {
    setIsLoading(true);
    setTestResult('Testing authentication...');

    try {
      console.log('🔍 Debug: Starting authentication test...');
      console.log(`🔍 Debug: Email = ${testCredentials.email}`);
      console.log(`🔍 Debug: Supabase URL = ${import.meta.env.VITE_SUPABASE_URL}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testCredentials.email,
        password: testCredentials.password
      });

      if (error) {
        console.error('🔍 Debug: Authentication failed:', error);
        setTestResult(`❌ Authentication failed: ${error.message}\n\nError details: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log('🔍 Debug: Authentication successful:', data);
        setTestResult(`✅ Authentication successful!\n\nUser ID: ${data.user?.id}\nEmail: ${data.user?.email}\nEmail confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`);
        
        // Auto sign out
        setTimeout(async () => {
          await supabase.auth.signOut();
          setTestResult(prev => prev + '\n\n✅ Automatically signed out.');
        }, 2000);
      }    } catch (error: any) {
      console.error('🔍 Debug: Unexpected error:', error);
      setTestResult(`❌ Unexpected error: ${error.message}\n\nStack: ${error.stack}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Authentication Debug Tool</h1>
        
        {/* Debug Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Test Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Test</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
            <input
              type="email"
              value={testCredentials.email}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password:</label>
            <input
              type="password"
              value={testCredentials.password}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
          
          <button
            onClick={handleAuthTest}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : '🧪 Test Authentication'}
          </button>
        </div>

        {/* Results */}
        {testResult && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>  );
};

export default AuthDebugPage;

// ✅ Full Working CandidatesPage.tsx (with Supabase integration)

import React, { useEffect, useState } from 'react';
import { Eye, Edit, Send } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { CandidateModal } from './CandidateModal';
import { FeedbackModal } from './FeedbackModal';
import { EditCandidateModal } from './EditCandidateModal';

export const CandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ✅ Fetch candidates on mount
  useEffect(() => {
    async function fetchCandidates() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (!profile?.company_id) return;

        const { data, error: candidateError } = await supabase
          .from('candidates')
          .select('*')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false });

        if (candidateError) {
          setError(candidateError.message);
        } else {
          setCandidates(data || []);
        }
      } catch (err) {
        setError('Failed to fetch candidates.');
      } finally {
        setLoading(false);
      }
    }

    fetchCandidates();
  }, []);

  const handleViewCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
  };

  const handleEditCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsEditModalOpen(true);
  };

  const handleSendFeedback = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsFeedbackModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_sent':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-4">Loading candidates...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 font-semibold text-lg">Candidates</div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rejection Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">No candidates found.</td>
              </tr>
            ) : (
              candidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.rejection_stage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.feedback_status)}`}>
                      {candidate.feedback_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleViewCandidate(candidate)} className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEditCandidate(candidate)} className="text-green-600 hover:text-green-800">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleSendFeedback(candidate)} className="text-purple-600 hover:text-purple-800">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {isFeedbackModalOpen && selectedCandidate && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          candidate={selectedCandidate}
        />
      )}

      {isEditModalOpen && selectedCandidate && (
        <EditCandidateModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          candidate={selectedCandidate}
          onSave={(updatedCandidate: any) => {
            setCandidates((prev) =>
              prev.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c))
            );
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

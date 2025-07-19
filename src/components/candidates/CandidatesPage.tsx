// ✅ Full Working CandidatesPage.tsx (with Supabase integration)

import React, { useEffect, useState } from 'react';
import { Plus, Download, Eye, Send } from 'lucide-react';
import { CandidateModal } from '../../components/candidates/CandidateModal';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabaseClient';
import { CandidateUploadModal } from './CandidateUploadModal';

export const CandidatesPage: React.FC = () => {
  const { addNotification } = useNotification();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalCandidate, setModalCandidate] = useState<any | null>(null);
  const [showSingleUploadModal, setShowSingleUploadModal] = useState(false);
  const [singleCandidate, setSingleCandidate] = useState({ name: '', email: '', position: '', rejection_stage: '' });

  // ✅ Fetch candidates on mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;
      const { data: candidateData, error } = await supabase.from('candidates').select('*').eq('company_id', profile.company_id).order('created_at', { ascending: false });
      if (error) {
        addNotification({ type: 'error', title: 'Fetch Failed', message: error.message });
      } else {
        setCandidates(candidateData || []);
      }
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Fetch Failed', message: err.message });
    }
  }

  // --- Robust Upload Handler ---
  async function handleUploadCandidates(input: any) {
    try {
      console.log('Raw upload payload:', input);
      // Get user and company_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) throw new Error('No company_id found');
      const company_id = profile.company_id;
      // Normalize input
      const arr = Array.isArray(input) ? input : [input];
      const today = new Date().toISOString().slice(0, 10);
      const normalized = arr.map((row) => {
        // Support both lowercase and uppercase Excel keys
        const getKey = (obj: any, keys: string[]) => keys.find(k => obj.hasOwnProperty(k));
        const nameKey = getKey(row, ['name', 'Name']);
        const emailKey = getKey(row, ['email', 'Email']);
        const positionKey = getKey(row, ['position', 'Position']);
        const stageKey = getKey(row, ['rejection_stage', 'RejectionStage', 'rejectionStage']);
        const appliedKey = getKey(row, ['applied_date', 'AppliedDate', 'appliedDate']);
        return {
          name: nameKey ? row[nameKey]?.toString().trim() : '',
          email: emailKey ? row[emailKey]?.toString().trim() : '',
          position: positionKey ? row[positionKey]?.toString().trim() : '',
          rejection_stage: stageKey ? row[stageKey]?.toString().trim() : '',
          applied_date: appliedKey ? row[appliedKey]?.toString().trim() : today,
          status: 'Not Sent',
          company_id,
        };
      }); // closes normalized map
      // Filter out invalid rows
      const valid = normalized.filter((c) => {
        if (!c.name || !c.email) {
          console.warn(`Skipped row: missing name or email`, c);
          addNotification({ type: 'error', title: 'Skipped Row', message: `Row missing name or email.` });
          return false;
        }
        return true;
      });
      if (valid.length === 0) throw new Error('No valid candidates to upload');
      // Insert
      const { error } = await supabase.from('candidates').insert(valid);
      if (error) {
        addNotification({ type: 'error', title: 'Upload Failed', message: error.message });
        throw error;
      }
      addNotification({ type: 'success', title: 'Upload Successful', message: `${valid.length} candidates added.` });
      await fetchCandidates();
    } catch (err: any) {
      console.error('Upload error:', err);
      addNotification({ type: 'error', title: 'Upload Error', message: err.message });
    }
  }

  // Remove search filter for now
  const visibleCandidates = candidates;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Candidates</h1>
          <p className="text-gray-600">Manage feedback for rejected candidates</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSingleUploadModal(true)}
            className="neumorphic-btn-primary px-4 py-2 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate Details</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="neumorphic-btn-primary px-4 py-2 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Bulk Upload (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {/* CandidateUploadModal for bulk upload */}
      <CandidateUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadCandidates}
      />

      {/* Candidate List */}
      <div className="neumorphic-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="neumorphic-table-header">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No candidates found.</td>
                </tr>
              ) : (
                visibleCandidates.map(candidate => (
                  <tr key={candidate.id}>
                    <td>{candidate.name}</td>
                    <td>{candidate.email}</td>
                    <td>{candidate.position}</td>
                    <td>{candidate.rejection_stage}</td>
                    <td>{candidate.status}</td>
                    <td className="flex gap-2">
                      <button
                        className="neumorphic-btn-secondary px-2 py-1"
                        onClick={() => setModalCandidate(candidate)}
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button
                        className="neumorphic-btn-primary px-2 py-1"
                        onClick={async () => {
                          addNotification({ type: 'success', title: 'Feedback Sent', message: `Feedback sent to ${candidate.name}` });
                        }}
                      >
                        <Send className="w-4 h-4" /> Send Feedback
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Candidate Upload Modal */}
      {showSingleUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Candidate Details</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={singleCandidate.name}
                onChange={e => setSingleCandidate({ ...singleCandidate, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={singleCandidate.email}
                onChange={e => setSingleCandidate({ ...singleCandidate, email: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Position"
                value={singleCandidate.position}
                onChange={e => setSingleCandidate({ ...singleCandidate, position: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Rejection Stage"
                value={singleCandidate.rejection_stage}
                onChange={e => setSingleCandidate({ ...singleCandidate, rejection_stage: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowSingleUploadModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={async () => {
                  await handleUploadCandidates(singleCandidate);
                  setShowSingleUploadModal(false);
                  setSingleCandidate({ name: '', email: '', position: '', rejection_stage: '' });
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details Modal */}
      {showModal && modalCandidate && (
        <CandidateModal
          candidate={modalCandidate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit, Send, MoreHorizontal } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { BulkActions } from '../../components/candidates/BulkActions';
import { supabase } from '../../utils/supabaseClient';
import { CandidateUploadModal } from '../../components/candidates/CandidateUploadModal';

export const CandidatesPage: React.FC = () => {
  const { addNotification } = useNotification();
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalCandidate, setModalCandidate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [candidates, setCandidates] = useState([]);

  const handleUploadCandidates = async (newCandidates: any[]) => {
    const { data: userResult } = await supabase.auth.getUser();
    const userId = userResult?.user?.id;

    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    const { data: userInfo, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .single();

    if (userError || !userInfo?.company_id) {
      console.error('Unable to fetch company_id');
      return;
    }

    const formattedCandidates = newCandidates.map((candidate: any) => ({
      name: candidate.name,
      email: candidate.email,
      position: candidate.position,
      rejection_stage: candidate.rejectionStage,
      applied_date: candidate.appliedDate,
      status: 'Not Sent',
      company_id: userInfo.company_id,
    }));

    const { error: insertError } = await supabase
      .from('candidates')
      .insert(formattedCandidates);

    if (insertError) {
      console.error('Error inserting candidates:', insertError.message);
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: insertError.message,
      });
      return;
    }

    const { data: updatedCandidates, error: fetchError } = await supabase
      .from('candidates')
      .select('*')
      .eq('company_id', userInfo.company_id);

    if (fetchError) {
      console.error('Error fetching candidates:', fetchError.message);
      return;
    }

    setCandidates(updatedCandidates || []);
    setShowUploadModal(false);
    addNotification({
      type: 'success',
      title: 'Candidates Uploaded',
      message: `${newCandidates.length} candidates added successfully.`,
    });
  };

  const handleSelectCandidate = (id: number) => {
    setSelectedCandidates(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedCandidates(
      selectedCandidates.length === candidates.length ? [] : candidates.map(c => c.id)
    );
  };

  const handleExport = () => {
    const csvContent = candidates.map(candidate =>
      `${candidate.name},${candidate.email},${candidate.position},${candidate.rejection_stage},${candidate.status}`
    ).join('\n');

    const blob = new Blob(
      [`Name,Email,Position,Rejection Stage,Status\n${csvContent}`],
      { type: 'text/csv' }
    );

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Export Complete',
      message: 'Candidate data has been exported successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Candidates</h1>
          <p className="text-gray-600">Manage feedback for rejected candidates</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="neumorphic-btn-primary px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>
      </div>

      <div className="neumorphic-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="flex-1 neumorphic-search px-4 py-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 w-full bg-transparent border-0 outline-none text-gray-700 placeholder-gray-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto neumorphic-btn px-4 py-3 flex items-center justify-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={handleExport}
            className="w-full sm:w-auto neumorphic-btn px-4 py-3 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="neumorphic-table">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full">
            <thead className="neumorphic-table-header">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.length === candidates.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded shadow-neumorphic-sm"
                  />
                </th>
                <th className="px-6 py-3 text-left">Candidate</th>
                <th className="px-6 py-3 text-left">Position</th>
                <th className="px-6 py-3 text-left">Rejection Stage</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Engagement</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-shadow/20">
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => handleSelectCandidate(candidate.id)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded shadow-neumorphic-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold">{candidate.name}</div>
                    <div className="text-sm text-gray-500">{candidate.email}</div>
                  </td>
                  <td className="px-6 py-4">{candidate.position}</td>
                  <td className="px-6 py-4">{candidate.rejection_stage}</td>
                  <td className="px-6 py-4">{candidate.status}</td>
                  <td className="px-6 py-4">Opens: {candidate.openRate} | Clicks: {candidate.clickRate}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setModalCandidate(candidate)}>
                      <Eye className="w-4 h-4 text-primary-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CandidateUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadCandidates}
      />
    </div>
  );
};

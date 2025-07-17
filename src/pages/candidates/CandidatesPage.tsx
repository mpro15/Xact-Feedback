import React, { useState } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit, Send, MoreHorizontal } from 'lucide-react';
import { CandidateFilters } from '../../components/candidates/CandidateFilters';
import { CandidateModal } from '../../components/candidates/CandidateModal';
import { BulkActions } from '../../components/candidates/BulkActions';
import { CandidateUploadModal } from '../../components/candidates/CandidateUploadModal';
import { useNotification } from '../../contexts/NotificationContext';
import { useFilters } from '../../contexts/FilterContext';
import { supabase } from '../../lib/supabaseClient';


export const CandidatesPage: React.FC = () => {
  const { addNotification } = useNotification();
  const { filters, updateCandidateFilters } = useFilters();
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalCandidate, setModalCandidate] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      position: 'Senior Frontend Developer',
      rejectionStage: 'Technical Interview',
      status: 'Draft',
      appliedDate: '2024-01-15',
      openRate: 0,
      clickRate: 0
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      position: 'Product Manager',
      rejectionStage: 'Final Interview',
      status: 'Sent',
      appliedDate: '2024-01-14',
      openRate: 1,
      clickRate: 3
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      position: 'UX Designer',
      rejectionStage: 'Portfolio Review',
      status: 'Not Sent',
      appliedDate: '2024-01-13',
      openRate: 0,
      clickRate: 0
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@email.com',
      position: 'Data Scientist',
      rejectionStage: 'Phone Screen',
      status: 'Sent',
      appliedDate: '2024-01-12',
      openRate: 2,
      clickRate: 1
    },
    {
      id: 5,
      name: 'Lisa Wang',
      email: 'lisa.wang@email.com',
      position: 'Marketing Manager',
      rejectionStage: 'Resume Screening',
      status: 'Draft',
      appliedDate: '2024-01-11',
      openRate: 0,
      clickRate: 0
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not Sent':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectCandidate = (id: number) => {
    setSelectedCandidates(prev => 
      prev.includes(id) 
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
  };

  const handleViewCandidate = (candidate: any) => {
    setModalCandidate(candidate);
    setShowModal(true);
  };

  const handleUploadCandidates = (newCandidates: any[]) => {
    const formattedCandidates = newCandidates.map((candidate, index) => ({
      id: candidates.length + index + 1,
      name: candidate.name,
      email: candidate.email,
      position: candidate.position,
      rejectionStage: candidate.rejectionStage,
      status: 'Not Sent',
      appliedDate: candidate.appliedDate,
      openRate: 0,
      clickRate: 0
    }));
    
    setCandidates(prev => [...prev, ...formattedCandidates]);
  };

  const handleSendFeedback = async () => {
    if (selectedCandidates.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Candidates Selected',
        message: 'Please select candidates to send feedback to.'
      });
      return;
    }

    // Simulate bulk sending with potential failures
    const results = [];
    for (const id of selectedCandidates) {
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      results.push({ id, success });
      
      if (success) {
        setCandidates(prev => 
          prev.map(c => c.id === id ? { ...c, status: 'Sent' } : c)
        );
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    if (failureCount === 0) {
      addNotification({
        type: 'success',
        title: 'Feedback Sent Successfully',
        message: `Feedback emails sent to ${successCount} candidate${successCount > 1 ? 's' : ''}`
      });
    } else {
      addNotification({
        type: 'warning',
        title: 'Partial Success',
        message: `${successCount} emails sent successfully, ${failureCount} failed. Failed emails will be retried automatically.`
      });
    }
    
    setSelectedCandidates([]);
  };

  const handleEditTemplates = () => {
    addNotification({
      type: 'info',
      title: 'Template Editor',
      message: 'Redirecting to email template editor...'
    });
  };

  const handleExport = () => {
    const csvContent = candidates.map(candidate => 
      `${candidate.name},${candidate.email},${candidate.position},${candidate.rejectionStage},${candidate.status}`
    ).join('\n');
    
    const blob = new Blob([`Name,Email,Position,Rejection Stage,Status\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Export Complete',
      message: 'Candidate data has been exported successfully'
    });
  };

  // Filter candidates based on current filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !filters.candidates.searchTerm || 
      candidate.name.toLowerCase().includes(filters.candidates.searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(filters.candidates.searchTerm.toLowerCase());
    
    const matchesStatus = !filters.candidates.status || candidate.status === filters.candidates.status;
    const matchesStage = !filters.candidates.stage || candidate.rejectionStage === filters.candidates.stage;
    const matchesPosition = !filters.candidates.position || 
      candidate.position.toLowerCase().includes(filters.candidates.position.toLowerCase());

    return matchesSearch && matchesStatus && matchesStage && matchesPosition;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Candidates</h1>
          <p className="text-gray-600">Manage feedback for rejected candidates</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="w-full sm:w-auto neumorphic-btn-primary px-4 py-2 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="neumorphic-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="flex-1 w-full neumorphic-search px-4 py-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates by name or email..."
              value={filters.candidates.searchTerm}
              onChange={(e) => updateCandidateFilters({ searchTerm: e.target.value })}
              className="pl-6 w-full bg-transparent border-0 outline-none text-gray-700 placeholder-gray-500"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full sm:w-auto neumorphic-btn px-4 py-3 flex items-center justify-center space-x-2 ${
              showFilters ? 'neumorphic-tab-active' : ''
            }`}
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

        {showFilters && <CandidateFilters />}
      </div>

      {/* Bulk Actions */}
      {selectedCandidates.length > 0 && (
        <BulkActions 
          selectedCount={selectedCandidates.length}
          onClear={() => setSelectedCandidates([])}
          onSendFeedback={handleSendFeedback}
          onEditTemplates={handleEditTemplates}
          onExport={handleExport}
        />
      )}

      {/* Candidates Table */}
      <div className="neumorphic-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="neumorphic-table-header">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded shadow-neumorphic-sm"
                  />
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Position
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Rejection Stage
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-shadow/20">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="neumorphic-table-row">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => handleSelectCandidate(candidate.id)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded shadow-neumorphic-sm"
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{candidate.name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                      <div className="sm:hidden text-xs text-gray-500 mt-1">
                        {candidate.position} • {candidate.rejectionStage}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {candidate.position}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {candidate.rejectionStage}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`neumorphic-badge text-xs font-semibold ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    <div className="flex space-x-4">
                      <span>Opens: {candidate.openRate}</span>
                      <span>Clicks: {candidate.clickRate}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button 
                        onClick={() => handleViewCandidate(candidate)}
                        className="neumorphic-btn p-2 text-primary-600 hover:text-primary-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="neumorphic-btn p-2 text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="neumorphic-btn p-2 text-purple-600 hover:text-purple-800"
                        title="Send Feedback"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button 
                        className="neumorphic-btn p-2 text-gray-600 hover:text-gray-800"
                        title="More Options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="neumorphic-card p-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="text-sm font-medium text-gray-700">
          Showing {filteredCandidates.length} of {candidates.length} candidates
        </div>
        <div className="flex items-center space-x-2">
          <button className="neumorphic-btn px-3 py-2 text-sm">Previous</button>
          <button className="neumorphic-btn-primary px-3 py-2 text-sm">1</button>
          <button className="neumorphic-btn px-3 py-2 text-sm">2</button>
          <button className="neumorphic-btn px-3 py-2 text-sm">3</button>
          <button className="neumorphic-btn px-3 py-2 text-sm">Next</button>
        </div>
      </div>

      {/* Modal */}
      {showModal && modalCandidate && (
        <CandidateModal 
          candidate={modalCandidate}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Upload Modal */}
      <CandidateUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUploadCandidates}
      />
    </div>
  );
};
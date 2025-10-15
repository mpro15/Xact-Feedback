// ✅ Full Working CandidatesPage.tsx (with Supabase integration)

import React, { useEffect, useState } from 'react';
import { Eye, Edit, Send, Upload, UserPlus, Download, FilePlus, Trash, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { CandidateModal } from './CandidateModal';
import { FeedbackModal } from './FeedbackModal';
import { EditCandidateModal } from './EditCandidateModal';
import { CandidateUploadModal } from './CandidateUploadModal';
import { CandidateFilters } from './CandidateFilters';
import { BulkFeedbackModal } from './BulkFeedbackModal';
import { AddCandidateModal } from './AddCandidateModal';
import * as XLSX from 'xlsx';
import { Candidate } from '../../lib/supabase';

export const CandidatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkFeedbackModalOpen, setIsBulkFeedbackModalOpen] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);  const [filterParams, setFilterParams] = useState({
    status: '',
    stage: '',
    dateRange: '',
  });

  const updateFilters = (newFilters: Partial<typeof filterParams>) => {
    setFilterParams(prev => ({ ...prev, ...newFilters }));
  };

  // ✅ Fetch candidates on mount
  useEffect(() => {
    fetchCandidates();
  }, [filterParams]);

  const fetchCandidates = async () => {
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

      if (!profile?.company_id) {
        console.log('No company_id found for user:', user.id, profile);
        return;
      }

      let query = supabase
        .from('candidates')
        .select('*')
        .eq('company_id', profile.company_id);

      console.log('Filter params:', filterParams);

      if (filterParams.status) {
        query = query.eq('feedback_status', filterParams.status.toLowerCase());
      }

      if (filterParams.stage) {
        query = query.eq('rejection_stage', filterParams.stage);
      }

      if (filterParams.dateRange) {
        const now = new Date();
        let daysAgo;
        
        switch (filterParams.dateRange) {
          case 'Last 7 days':
            daysAgo = 7;
            break;
          case 'Last 30 days':
            daysAgo = 30;
            break;
          case 'Last 90 days':
            daysAgo = 90;
            break;
          default:
            daysAgo = 0;
        }
        
        if (daysAgo > 0) {
          const fromDate = new Date();
          fromDate.setDate(now.getDate() - daysAgo);
          query = query.gte('created_at', fromDate.toISOString());
        }
      }

      const { data, error: candidateError } = await query.order('created_at', { ascending: false });
      console.log('Candidates query result:', data, candidateError);

      if (candidateError) {
        setError(candidateError.message);
      } else {
        setCandidates(data || []);
      }
    } catch (err) {
      setError('Failed to fetch candidates.');
      console.error('Fetch candidates error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsEditModalOpen(true);
  };

  const handleSendFeedback = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsFeedbackModalOpen(true);
  };

  const handleSendBulkFeedback = () => {
    setIsBulkFeedbackModalOpen(true);
  };
  const handleDownloadTemplate = () => {
    // Create a comprehensive template with headers, instructions, and example rows
    const worksheetData = [
      ['Xact Feedback - Candidate Upload Template'],
      ['Instructions:'],
      ['1. Fill in candidate details following the format below (starting from row 9)'],
      ['2. Required fields: Candidate Name, Email, Position, Rejection Stage'],
      ['3. Date format: YYYY-MM-DD (e.g., 2025-08-15)'],
      ['4. Don\'t modify the header row'],
      ['5. Save as .xlsx before uploading'],
      [''],
      ['Candidate Name', 'Email', 'Position', 'Rejection Stage', 'Rejection Reason', 'Applied Date'],
      ['John Smith', 'john.smith@example.com', 'Software Engineer', 'Technical Interview', 'Insufficient technical skills', '2025-08-10'],
      ['Jane Doe', 'jane.doe@example.com', 'Product Manager', 'Final Interview', 'Not aligned with company culture', '2025-08-12'],
      ['Alex Johnson', 'alex.johnson@example.com', 'UX Designer', 'Portfolio Review', 'Portfolio lacked required depth', '2025-08-14']
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      // Add styling for the title and instructions
    for (let i = 0; i <= 7; i++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: i, c: 0 })];
      if (cell) {
        if (i === 0) {
          // Title styling
          cell.s = { font: { bold: true, color: { rgb: "0000FF" }, sz: 14 } };
        } else {
          // Instructions styling
          cell.s = { font: { bold: i === 1, color: { rgb: "0000FF" } } };
        }
      }
    }
    
    // Add column widths for better readability
    const wscols = [
      {wch: 20}, // Name
      {wch: 28}, // Email
      {wch: 20}, // Position
      {wch: 20}, // Rejection Stage
      {wch: 35}, // Rejection Reason
      {wch: 15}  // Applied Date
    ];
    worksheet['!cols'] = wscols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');
    XLSX.writeFile(workbook, 'Candidate_Upload_Template.xlsx');
  };

  const handleExportSelectedCandidates = () => {
    const selectedData = candidates.filter(c => selectedCandidates.includes(c.id));
    if (selectedData.length === 0) return;
    
    const worksheet = XLSX.utils.json_to_sheet(selectedData.map(c => ({
      'Name': c.name,
      'Email': c.email,
      'Position': c.position,
      'Rejection Stage': c.rejection_stage,
      'Rejection Reason': c.rejection_reason || '',
      'Applied Date': c.applied_date,
      'Feedback Status': c.feedback_status
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Candidates');
    XLSX.writeFile(workbook, 'Selected_Candidates.xlsx');
  };

  const handleDeleteSelectedCandidates = async () => {
    if (selectedCandidates.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedCandidates.length} candidate(s)?`)) return;
    
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .in('id', selectedCandidates);
        
      if (error) {
        console.error('Error deleting candidates:', error);
        return;
      }
      
      // Remove deleted candidates from state
      setCandidates(prev => prev.filter(c => !selectedCandidates.includes(c.id)));
      setSelectedCandidates([]);
      setSelectAll(false);
    } catch (err) {
      console.error('Failed to delete candidates:', err);
    }
  };

  const handleUploadSuccess = (newCandidates: Candidate[]) => {
    setCandidates(prev => [...newCandidates, ...prev]);
    setIsUploadModalOpen(false);
  };

  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidates(prev => 
      prev.includes(id) 
        ? prev.filter(cId => cId !== id) 
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
    setSelectAll(!selectAll);
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

  if (loading) return (
    <div className="p-8 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading candidates...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">      <div className="rounded-full h-8 w-8 bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <X className="h-5 w-5" />
      </div>
      <p className="text-red-600">{error}</p>
      <button 
        onClick={() => fetchCandidates()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header with actions */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">Candidates</h1>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Candidate</span>
            </button>
            
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Upload</span>
            </button>
            
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
            >
              <FilePlus className="w-4 h-4" />
              <span>Download Template</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border ${showFilters ? 'bg-gray-100 text-gray-800' : 'bg-white text-gray-700'} rounded-lg hover:bg-gray-100 flex items-center gap-2 transition-colors`}
            >
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Bulk action buttons - show only when candidates are selected */}
        {selectedCandidates.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap items-center gap-4">
            <span className="text-gray-700 font-medium">
              {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} selected
            </span>
            
            <div className="flex-grow"></div>
            
            <button
              onClick={handleSendBulkFeedback}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              disabled={selectedCandidates.length === 0}
            >
              <Send className="w-4 h-4" />
              <span>Send Feedback</span>
            </button>
            
            <button
              onClick={handleExportSelectedCandidates}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              disabled={selectedCandidates.length === 0}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            
            <button
              onClick={handleDeleteSelectedCandidates}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
              disabled={selectedCandidates.length === 0}
            >
              <Trash className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}        {/* Filters */}
        {showFilters && (
          <CandidateFilters 
            filters={filterParams} 
            onFilterChange={updateFilters} 
            onClearFilters={() => setFilterParams({ status: '', stage: '', dateRange: '' })} 
          />
        )}
      </div>

      {/* Candidates table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </th>
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
                <td colSpan={6} className="text-center py-8 text-gray-500">No candidates found.</td>
              </tr>
            ) : (
              candidates.map(candidate => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => toggleSelectCandidate(candidate.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </td>
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
                      <button onClick={() => handleViewCandidate(candidate)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEditCandidate(candidate)} className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleSendFeedback(candidate)} className="text-purple-600 hover:text-purple-800 p-1 rounded-full hover:bg-purple-100">
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

      {/* Modals */}
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
          onSuccess={() => {
            fetchCandidates();
            setIsFeedbackModalOpen(false);
          }}
        />
      )}

      {isEditModalOpen && selectedCandidate && (
        <EditCandidateModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          candidate={selectedCandidate}
          onSave={(updatedCandidate) => {
            setCandidates((prev) =>
              prev.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c))
            );
            setIsEditModalOpen(false);
          }}
        />
      )}

      {isUploadModalOpen && (
        <CandidateUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUploadSuccess}
        />
      )}

      {isAddModalOpen && (
        <AddCandidateModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}          onAdd={(newCandidate: Candidate) => {
            setCandidates(prev => [newCandidate, ...prev]);
            setIsAddModalOpen(false);
          }}
        />
      )}

      {isBulkFeedbackModalOpen && (
        <BulkFeedbackModal
          isOpen={isBulkFeedbackModalOpen}
          onClose={() => setIsBulkFeedbackModalOpen(false)}
          candidateIds={selectedCandidates}
          onSuccess={() => {
            fetchCandidates();
            setIsBulkFeedbackModalOpen(false);
            setSelectedCandidates([]);
          }}
        />
      )}
    </div>
  );
};

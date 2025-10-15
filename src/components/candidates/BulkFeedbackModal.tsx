import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Candidate } from '../../lib/supabase';
import { Loader, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface BulkFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateIds: string[];
  onSuccess: () => void;
}

export const BulkFeedbackModal: React.FC<BulkFeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  candidateIds,
  onSuccess 
}) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [feedbackTemplate, setFeedbackTemplate] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(() => {
    if (isOpen && candidateIds.length > 0) {
      fetchCandidates();
    }
  }, [isOpen, candidateIds]);

  const fetchCandidates = async () => {
    if (candidateIds.length === 0) {
      onClose();
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .in('id', candidateIds);
        
      if (error) {
        throw error;
      }
      
      setCandidates(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateAndSendAll = async () => {
    if (candidates.length === 0) return;
    
    setGenerating(true);
    setSendingProgress(0);
    setCompletedCount(0);
    
    try {
      let completed = 0;
      
      for (const candidate of candidates) {
        try {
          // Generate AI feedback
          const { data: feedbackData, error: feedbackError } = await supabase.functions.invoke('generate_feedback', {
            body: {
              candidateId: candidate.id,
              position: candidate.position,
              rejectionStage: candidate.rejection_stage,
              rejectionReason: candidate.rejection_reason
            }
          });
          
          if (feedbackError) throw feedbackError;
          
          // Send the feedback
          const { error: sendError } = await supabase.functions.invoke('send_feedback', {
            body: {
              candidateId: candidate.id,
              feedback: feedbackData.feedback
            }
          });
          
          if (sendError) throw sendError;
          
          // Update candidate status
          const { error: updateError } = await supabase
            .from('candidates')
            .update({ feedback_status: 'sent' })
            .eq('id', candidate.id);
            
          if (updateError) throw updateError;
          
          completed++;
          setCompletedCount(completed);
          setSendingProgress(Math.round((completed / candidates.length) * 100));
          
        } catch (err) {
          console.error(`Error processing candidate ${candidate.id}:`, err);
          // Continue with other candidates even if one fails
        }
      }
      
      if (completed > 0) {
        setShowSuccess(true);
        // Wait 3 seconds before closing modal on success
        setTimeout(() => {
          onSuccess();
        }, 3000);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to process candidates');
    } finally {
      setGenerating(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Bulk Generate & Send Feedback</h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading candidates...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        ) : showSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700">
                Successfully sent feedback to {completedCount} candidates!
              </span>
            </div>
          </div>
        ) : (
          <>            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <Send className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-blue-800 font-medium">
                    Bulk Feedback Generation
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    You're about to generate and send AI feedback to {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}.
                    Each candidate will receive a personalized email with feedback based on their position and rejection stage.
                  </p>
                </div>
              </div>
            </div>
            
            {candidates.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Selected Candidates:</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {candidates.length} selected
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                  <ul className="divide-y divide-gray-200">
                    {candidates.map(candidate => (
                      <li key={candidate.id} className="px-4 py-3 text-sm hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-gray-500 text-xs mt-1">{candidate.email}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {candidate.position}
                            </span>
                            <div className="text-gray-500 text-xs mt-1">
                              {candidate.rejection_stage}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Scroll to see all selected candidates
                </p>
              </div>
            )}
              {/* Template selector with enhanced UI */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Template Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    feedbackTemplate === '' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFeedbackTemplate('')}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${
                      feedbackTemplate === '' ? 'bg-blue-500' : 'bg-gray-200'
                    } mr-2`}></div>
                    <h4 className="font-medium text-gray-800">Default Template</h4>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 ml-6">Balanced feedback with mixed tone</p>
                </div>
                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    feedbackTemplate === 'detailed' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFeedbackTemplate('detailed')}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${
                      feedbackTemplate === 'detailed' ? 'bg-blue-500' : 'bg-gray-200'
                    } mr-2`}></div>
                    <h4 className="font-medium text-gray-800">Detailed Feedback</h4>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 ml-6">In-depth analysis with specific points</p>
                </div>
                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    feedbackTemplate === 'concise' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFeedbackTemplate('concise')}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${
                      feedbackTemplate === 'concise' ? 'bg-blue-500' : 'bg-gray-200'
                    } mr-2`}></div>
                    <h4 className="font-medium text-gray-800">Concise Feedback</h4>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 ml-6">Brief but actionable feedback</p>
                </div>
                <div 
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    feedbackTemplate === 'course-focused' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFeedbackTemplate('course-focused')}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${
                      feedbackTemplate === 'course-focused' ? 'bg-blue-500' : 'bg-gray-200'
                    } mr-2`}></div>
                    <h4 className="font-medium text-gray-800">Course-Focused</h4>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 ml-6">Emphasizes learning recommendations</p>
                </div>
              </div>
            </div>
              {generating && (
              <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">Bulk Processing Progress</h4>
                  <span className="text-sm font-medium text-blue-600">
                    {sendingProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${sendingProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">
                    Processing candidate {completedCount} of {candidates.length}
                  </p>
                  <p className="text-gray-600">
                    {candidates.length - completedCount} remaining
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <p>Each candidate's feedback is being generated and sent individually with personalized content.</p>
                  <p className="mt-1">This process may take a few minutes to complete. Please don't close this window.</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                disabled={generating}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAndSendAll}
                disabled={candidates.length === 0 || generating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                {generating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Generate & Send All
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BulkFeedbackModal;

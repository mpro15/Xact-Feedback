import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Candidate } from '../../lib/supabase';
import { AlertCircle, CheckCircle, User } from 'lucide-react';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newCandidate: Candidate) => void;
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState<Partial<Candidate>>({
    name: '',
    email: '',
    position: '',
    rejection_stage: '',
    rejection_reason: '',
    applied_date: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Lock body scroll while modal is open
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow || '';
      };
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    
    if (!formData.position?.trim()) {
      errors.position = 'Position is required';
    }
    
    if (!formData.rejection_stage?.trim()) {
      errors.rejection_stage = 'Rejection stage is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data: userProfile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();
        
      if (!userProfile?.company_id) {
        throw new Error('User has no associated company');
      }
      
      const candidateData = {
        ...formData,
        company_id: userProfile.company_id,
        feedback_status: 'not_sent',
        email_opens: 0,
        email_clicks: 0,
        course_enrollments: 0,
        reapplied: false,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('candidates')
        .insert([candidateData])
        .select();
        
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      
      // Delay to show success message
      setTimeout(() => {
        if (data && data[0]) {
          onAdd(data[0]);
        }
        onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to add candidate');
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Candidate</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>
          {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center my-8 animate-fadeIn">
            <div className="animate-bounce-once">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            </div>
            <p className="text-green-700 font-medium">Candidate Added Successfully!</p>
            <p className="text-green-600 text-sm mt-2">
              You'll be able to generate personalized feedback for this candidate.
            </p>
          </div>
        ): error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className={`w-full border ${validationErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg pl-10 px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter full name"
                />
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={`w-full border ${validationErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="candidate@example.com"
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position Applied For *</label>
              <input
                type="text"
                name="position"
                value={formData.position || ''}
                onChange={handleChange}
                className={`w-full border ${validationErrors.position ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., Software Engineer"
              />
              {validationErrors.position && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.position}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Stage *</label>
              <select
                name="rejection_stage"
                value={formData.rejection_stage || ''}
                onChange={handleChange}
                className={`w-full border ${validationErrors.rejection_stage ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select Stage</option>
                <option value="Resume Screening">Resume Screening</option>
                <option value="Phone Screen">Phone Screen</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="Final Interview">Final Interview</option>
                <option value="Cultural Fit">Cultural Fit</option>
                <option value="Reference Check">Reference Check</option>
              </select>
              {validationErrors.rejection_stage && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.rejection_stage}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
              <textarea
                name="rejection_reason"
                value={formData.rejection_reason || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Why the candidate was rejected"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
              <input
                type="date"
                name="applied_date"
                value={formData.applied_date || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || success}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                <span>Add Candidate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCandidateModal;

import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Candidate } from '../../lib/supabase';

interface EditCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  onSave: (updatedCandidate: any) => void;
}

export const EditCandidateModal: React.FC<EditCandidateModalProps> = ({ isOpen, onClose, candidate, onSave }) => {
  const [formData, setFormData] = useState<Partial<Candidate>>({
    name: candidate.name,
    email: candidate.email,
    position: candidate.position,
    rejection_stage: candidate.rejection_stage,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    console.log('Saving candidate details...');
    const { data, error } = await supabase
      .from('candidates')
      .update(formData as Partial<Candidate>)
      .eq('id', candidate.id);

    if (error) {
      console.error('Error updating candidate:', error);
    } else if (data) {
      const updatedData = data as Candidate[];
      if (updatedData.length > 0) {
        console.log('Candidate updated successfully:', updatedData);
        onSave(updatedData[0]);
        console.log('Closing modal...');
        onClose(); // Close the modal after saving changes
      } else {
        console.warn('No data returned from update operation.');
      }
    } else {
      console.warn('Data is null.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Candidate</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rejection Stage</label>
            <select
              name="rejection_stage"
              value={formData.rejection_stage}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="Resume Screening">Resume Screening</option>
              <option value="Phone Screen">Phone Screen</option>
              <option value="Technical Interview">Technical Interview</option>
              <option value="Final Interview">Final Interview</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

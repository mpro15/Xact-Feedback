import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

interface CandidateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (candidates: any[]) => void;
}

export const CandidateUploadModal: React.FC<CandidateUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const { addNotification } = useNotification();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      addNotification({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please upload an Excel (.xlsx) or CSV file'
      });
      return;
    }

    setUploading(true);
    
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock parsed data
      const mockCandidates = [
        {
          name: 'Alice Johnson',
          email: 'alice.johnson@email.com',
          position: 'Frontend Developer',
          rejectionStage: 'Technical Interview',
          rejectionReason: 'Insufficient React experience',
          appliedDate: '2024-01-20'
        },
        {
          name: 'Bob Smith',
          email: 'bob.smith@email.com',
          position: 'Backend Developer',
          rejectionStage: 'Final Interview',
          rejectionReason: 'Cultural fit concerns',
          appliedDate: '2024-01-19'
        },
        {
          name: 'Carol Davis',
          email: 'carol.davis@email.com',
          position: 'Product Manager',
          rejectionStage: 'Phone Screen',
          rejectionReason: 'Lack of product management experience',
          appliedDate: '2024-01-18'
        }
      ];

      onUpload(mockCandidates);
      
      addNotification({
        type: 'success',
        title: 'Upload Successful',
        message: `Successfully imported ${mockCandidates.length} candidates`
      });
      
      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to process the file. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a mock CSV template
    const csvContent = `Candidate Name,Email,Position,Rejection Stage,Rejection Reason,Applied Date
John Doe,john.doe@email.com,Software Engineer,Technical Interview,Insufficient experience with React,2024-01-15
Jane Smith,jane.smith@email.com,Product Manager,Final Interview,Cultural fit concerns,2024-01-14`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidate_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Template Downloaded',
      message: 'Candidate upload template has been downloaded'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Candidates</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Required Columns</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Your file must include: Candidate Name, Email, Position, Rejection Stage, Rejection Reason, Applied Date
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {uploading ? 'Processing file...' : 'Drop your file here'}
              </p>
              <p className="text-sm text-gray-600">
                or click to browse for Excel (.xlsx) or CSV files
              </p>
            </div>
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className={`mt-4 inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Processing...' : 'Choose File'}</span>
            </label>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Supported Formats</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Excel files (.xlsx)</li>
              <li>• CSV files (.csv)</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Maximum 1000 candidates per upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
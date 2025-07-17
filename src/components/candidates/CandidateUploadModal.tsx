// CandidateUploadModal.tsx
import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';

interface CandidateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (candidates: any[]) => void;
}

export const CandidateUploadModal: React.FC<CandidateUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateCandidate = (candidate: any): boolean => {
    return (
      typeof candidate.name === 'string' &&
      typeof candidate.email === 'string' &&
      typeof candidate.position === 'string' &&
      typeof candidate.rejection_stage === 'string'
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const validCandidates = (data as any[]).filter(validateCandidate);

      if (validCandidates.length === 0) {
        setError('No valid candidates found in the uploaded file.');
        return;
      }

      setError(null);
      onUpload(validCandidates);
      onClose();
    };

    reader.readAsBinaryString(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Upload Candidates</h2>
        <p className="text-sm text-gray-500">
          Upload a CSV or Excel file with columns: <strong>name, email, position, rejection_stage</strong>.
        </p>
        <div className="neumorphic-card p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200"
          />
          {fileName && <p className="mt-2 text-xs text-gray-500">File: {fileName}</p>}
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
        <button
          onClick={onClose}
          className="mt-4 neumorphic-btn px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </Dialog>
  );
};

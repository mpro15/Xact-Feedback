import React, { useRef } from 'react';
import * as XLSX from 'xlsx';

interface CandidateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (rows: any[]) => void;
}

export const CandidateUploadModal: React.FC<CandidateUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        console.log('Raw XLSX rows:', rawRows);
        // Normalize headers
        const normalizedRows = rawRows.map((row: any) => {
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
            applied_date: appliedKey ? row[appliedKey]?.toString().trim() : '',
          };
        });
        const validRows = normalizedRows.filter((c: { name: string; email: string }, idx: number) => {
          if (!c.name || !c.email) {
            console.warn(`Skipped row ${idx + 1}: missing name or email`, c);
            return false;
          }
          return true;
        });
        if (validRows.length === 0) {
          console.warn('No valid candidates found in file.');
        }
        onUpload(validRows);
        onClose();
      } catch (err) {
        console.error('File upload error:', err);
        onClose();
      }
    };
    reader.readAsBinaryString(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Upload Candidate File</h2>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="mb-4"
          accept=".csv,.xlsx,.xls,.json"
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
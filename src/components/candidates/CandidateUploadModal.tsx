import React from 'react';
import * as XLSX from 'xlsx';

interface CandidateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export const CandidateUploadModal: React.FC<CandidateUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
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
          const reasonKey = getKey(row, ['rejection_reason', 'RejectionReason', 'rejectionReason']);
          const appliedKey = getKey(row, ['applied_date', 'AppliedDate', 'appliedDate']);
          return {
            name: nameKey ? row[nameKey]?.toString().trim() : '',
            email: emailKey ? row[emailKey]?.toString().trim() : '',
            position: positionKey ? row[positionKey]?.toString().trim() : '',
            rejection_stage: stageKey ? row[stageKey]?.toString().trim() : '',
            rejection_reason: reasonKey ? row[reasonKey]?.toString().trim() : '',
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

  const handleDownloadTemplate = () => {
    const worksheetData = [
      ['Candidate Name', 'Email', 'Position', 'Rejection Stage', 'Rejection Reason', 'Applied Date']
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'Candidate_Template.xlsx');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upload Candidates</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Your file must include:</p>
          <ul className="text-sm text-gray-600 list-disc pl-5">
            <li>Candidate Name</li>
            <li>Email</li>
            <li>Position</li>
            <li>Rejection Stage</li>
            <li>Rejection Reason</li>
            <li>Applied Date</li>
          </ul>
        </div>

        <button
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
          onClick={handleDownloadTemplate}
        >
          Download Template
        </button>

        <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 text-center mb-4">
          <p className="text-sm text-gray-600 mb-2">Drop your file here or click to browse</p>
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
            Choose File
          </label>
        </div>

        <div className="text-sm text-gray-600">
          <p>Supported Formats:</p>
          <ul className="list-disc pl-5">
            <li>Excel files (.xlsx)</li>
            <li>CSV files (.csv)</li>
            <li>Maximum file size: 10MB</li>
            <li>Maximum 1000 candidates per upload</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
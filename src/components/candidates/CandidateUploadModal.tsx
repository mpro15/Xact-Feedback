import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabaseClient';
import { Candidate } from '../../lib/supabase';
import { Upload, AlertCircle, CheckCircle, XCircle, Loader, FilePlus } from 'lucide-react';

interface CandidateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (candidates: Candidate[]) => void;
}

export const CandidateUploadModal: React.FC<CandidateUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadError(null);
  };
  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }
    
    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the maximum limit of 10MB');
      return;
    }
    
    // Validate file type
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'csv') {
      setUploadError('Only Excel (.xlsx) and CSV (.csv) files are supported');
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (evt) => {
        try {
          const data = evt.target?.result;          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1 }) as any[];
          
          // Skip potential instruction rows (first 8 rows might be instructions)
          const dataRows = rawRows.filter((row: any[]) => {
            // Skip empty rows or instruction rows
            if (!row || !row.length) return false;
            
            // Check if this might be a header row
            const firstCell = String(row[0] || '').toLowerCase();
            return !(firstCell.includes('instruction') || firstCell.includes('template') || !firstCell);
          });
          
          // Get header row (first non-empty row)
          const headerRow = dataRows[0] as string[];
            // Convert data to JSON with column headers
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, any>[];
          
          // Basic validation of structure
          if (!headerRow || headerRow.length < 3) {
            throw new Error('Invalid file format: Missing required columns. Please use the template provided.');
          }
          
          // Validate required columns exist
          const requiredColumns = ['Candidate Name', 'Email', 'Position', 'Rejection Stage'];
          const headerLower = headerRow.map(h => (String(h || '')).toLowerCase());
          
          const missingColumns = requiredColumns.filter(col => {
            const colLower = col.toLowerCase();
            return !headerLower.some(h => h.includes(colLower));
          });
          
          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}. Please use the template provided.`);
          }
          
          // Progress tracking
          let processed = 0;
          const totalRows = jsonData.length;
          
          if (totalRows === 0) {
            throw new Error('No data found in the file. Please add candidate information.');
          }
          
          if (totalRows > 1000) {
            throw new Error('File contains too many candidates. Maximum limit is 1000 per upload.');
          }
          
          // Prepare normalized data
          const normalizedRows: Candidate[] = [];
          const invalidRows: Array<{row: number, reason: string}> = [];
          
          // Helper function to find the appropriate key
          const getKey = (obj: Record<string, any>, keys: string[]) => keys.find(k => obj.hasOwnProperty(k));
          
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i] as Record<string, any>;
            processed++;
            setUploadProgress(Math.round((processed / totalRows) * 100));
            
            const nameKey = getKey(row, ['name', 'Name', 'Candidate Name', 'candidate name', 'candidateName', 'CandidateName']);
            const emailKey = getKey(row, ['email', 'Email', 'email address', 'emailAddress', 'EmailAddress']);
            const positionKey = getKey(row, ['position', 'Position', 'job', 'Job', 'title', 'Title', 'job title', 'Job Title', 'jobTitle', 'JobTitle']);
            const stageKey = getKey(row, ['rejection_stage', 'Rejection Stage', 'RejectionStage', 'rejectionStage', 'stage', 'Stage']);
            const reasonKey = getKey(row, ['rejection_reason', 'Rejection Reason', 'RejectionReason', 'rejectionReason', 'reason', 'Reason']);
            const appliedKey = getKey(row, ['applied_date', 'Applied Date', 'AppliedDate', 'appliedDate', 'date', 'Date']);
            
            const name = nameKey ? String(row[nameKey] || '').trim() : '';
            const email = emailKey ? String(row[emailKey] || '').trim() : '';
            const position = positionKey ? String(row[positionKey] || '').trim() : '';
            const rejection_stage = stageKey ? String(row[stageKey] || '').trim() : '';
              // Validate required fields
            if (!name) {
              invalidRows.push({row: i + 2, reason: 'Missing name'});
              continue;
            }
            
            if (!email) {
              invalidRows.push({row: i + 2, reason: 'Missing email'});
              continue;
            }
            
            if (!position) {
              invalidRows.push({row: i + 2, reason: 'Missing position'});
              continue;
            }
            
            if (!rejection_stage) {
              invalidRows.push({row: i + 2, reason: 'Missing rejection stage'});
              continue;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              invalidRows.push({row: i + 2, reason: 'Invalid email format'});
              continue;
            }
            
            const rejection_reason = reasonKey ? String(row[reasonKey] || '').trim() : '';
            const applied_date = appliedKey ? String(row[appliedKey] || '').trim() : '';
            
            const candidate: Partial<Candidate> = {
              name,
              email,
              position,
              rejection_stage,
              rejection_reason,
              applied_date,
              feedback_status: 'not_sent',
              email_opens: 0,
              email_clicks: 0,
              course_enrollments: 0,
              reapplied: false,
            };
            
            normalizedRows.push(candidate as Candidate);
          }
          
          if (normalizedRows.length === 0) {
            if (invalidRows.length > 0) {
              throw new Error(`No valid candidates found. Please fix the following issues:\n${invalidRows.slice(0, 5).map(r => `Row ${r.row}: ${r.reason}`).join('\n')}${invalidRows.length > 5 ? `\n...and ${invalidRows.length - 5} more errors` : ''}`);
            } else {
              throw new Error('No valid candidates found in the file');
            }
          }
          
          // Get user and company info for the upload
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
          
          // Prepare final data for insert
          const candidatesWithCompanyInfo = normalizedRows.map(candidate => ({
            ...candidate,
            company_id: userProfile.company_id,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
          
          // Insert into database
          const { data: insertedCandidates, error } = await supabase
            .from('candidates')
            .insert(candidatesWithCompanyInfo)
            .select();
            
          if (error) {
            throw error;
          }
          
          setUploadSuccess(true);
          
          // Show warning for invalid rows if any
          if (invalidRows.length > 0) {
            setUploadError(`Warning: ${invalidRows.length} rows had errors and were skipped. ${normalizedRows.length} candidates were successfully uploaded.`);
          }
          
          setTimeout(() => {
            onUpload(insertedCandidates || []);
            onClose();
          }, 2000);
          
        } catch (err: any) {
          setUploadError(err.message || 'File processing failed');
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        setUploadError('File reading failed');
        setUploading(false);
      };
      
      reader.readAsBinaryString(selectedFile);
      
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      setUploading(false);
    }
  };  const handleDownloadTemplate = () => {
    // Create a template with headers, example rows and instructions
    const worksheetData = [
      ['Candidate Upload Template - Instructions'],
      ['1. Fill in the candidate details in the format shown below'],
      ['2. Required fields: Candidate Name, Email, Position, Rejection Stage'],
      ['3. Date format: YYYY-MM-DD (e.g., 2025-08-15)'],
      ['4. Don\'t change the column headers'],
      ['5. Save as .xlsx or .csv before uploading'],
      [''],
      ['Candidate Name', 'Email', 'Position', 'Rejection Stage', 'Rejection Reason', 'Applied Date'],
      ['John Smith', 'john.smith@example.com', 'Software Engineer', 'Technical Interview', 'Insufficient technical skills', '2025-08-10'],
      ['Jane Doe', 'jane.doe@example.com', 'Product Manager', 'Final Interview', 'Not aligned with company culture', '2025-08-12']
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Add styling for the instructions
    for (let i = 0; i <= 6; i++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: i, c: 0 })];
      if (cell) cell.s = { font: { bold: true, color: { rgb: "0000FF" } } };
    }
    
    // Add column widths for better readability
    const wscols = [
      {wch: 20}, // Name
      {wch: 25}, // Email
      {wch: 20}, // Position
      {wch: 20}, // Rejection Stage
      {wch: 30}, // Rejection Reason
      {wch: 15}  // Applied Date
    ];
    worksheet['!cols'] = wscols;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates');
    XLSX.writeFile(workbook, 'Candidate_Upload_Template.xlsx');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upload Candidates</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
        </div>

        {uploadSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-700 font-medium">Upload Successful!</p>
            <p className="text-green-600">Candidates have been added to your database.</p>
          </div>
        ) : uploadError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700">{uploadError}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Your file must include:</p>
              <ul className="text-sm text-gray-600 list-disc pl-5">
                <li><span className="font-medium">Candidate Name</span> - Full name</li>
                <li><span className="font-medium">Email</span> - Valid email address</li>
                <li><span className="font-medium">Position</span> - Job title applied for</li>
                <li><span className="font-medium">Rejection Stage</span> - e.g., Resume Screening, Phone Screen</li>
                <li><span className="font-medium">Rejection Reason</span> - Why they were not selected</li>
                <li><span className="font-medium">Applied Date</span> - YYYY-MM-DD format</li>
              </ul>
            </div>

            <button
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4 flex items-center justify-center"
              onClick={handleDownloadTemplate}
            >
              <FilePlus className="w-4 h-4 mr-2" />
              Download Template
            </button>
          </>
        )}

        {uploading ? (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Uploading and processing... {uploadProgress}%
            </p>
          </div>
        ) : (
          <div className="border-dashed border-2 border-gray-300 rounded-lg p-6 text-center mb-4">
            {selectedFile ? (
              <div className="mb-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Drop your file here or click to browse</p>
              </>
            )}
            
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            <div className="flex flex-col items-center gap-3">
              <label htmlFor="file-upload" className="cursor-pointer py-2 px-4 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {selectedFile ? 'Choose Different File' : 'Choose File'}
              </label>
              
              {selectedFile && (
                <button
                  onClick={handleFileUpload}
                  className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Upload Candidates
                </button>
              )}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>Supported Formats:</p>
          <ul className="list-disc pl-5">
            <li>Excel files (.xlsx)</li>
            <li>CSV files (.csv)</li>
            <li>Maximum file size: 10MB</li>
            <li>Maximum 1000 candidates per upload</li>
          </ul>
          
          <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700">
              <strong>Pro tip:</strong> For best results, download our template first and follow the format exactly.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
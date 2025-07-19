import React, { useEffect, useState } from 'react';
import { Eye, Mail, FileText, Send, Download, BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabaseClient';

export const PreviewSettings: React.FC = () => {
  const { primaryColor, companyName } = useTheme();
  const { addNotification } = useNotification();
  const [previewType, setPreviewType] = useState<'email' | 'pdf'>('email');
  const [downloadCount, setDownloadCount] = useState(0);
  const [candidate, setCandidate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCandidate() {
      setLoading(true);
      setError(null);
      // Get current user and company
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();
      if (!profile?.company_id) {
        setError('No company found');
        setLoading(false);
        return;
      }
      // Fetch a candidate for preview
      const { data: candidates, error: candidateError } = await supabase
        .from('candidates')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (candidateError) {
        setError(candidateError.message);
        setLoading(false);
        return;
      }
      setCandidate(candidates && candidates[0] ? candidates[0] : null);
      setLoading(false);
    }
    fetchCandidate();
  }, []);

  if (loading) return <div className="p-4">Loading preview...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  const renderEmailPreview = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span className="font-medium text-gray-900">{companyName}</span>
          </div>
          <span className="text-sm text-gray-500">hr@{companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          Thank you for your application - {candidate.name}
        </h3>
      </div>

      <div className="prose prose-sm max-w-none">
        <p>Dear {candidate.name},</p>
        
        <p>
          Thank you for your interest in the <strong>{candidate.position}</strong> position at {companyName}. 
          While we were impressed with your background and experience, we have decided to move forward with another candidate.
        </p>

        <p>
          We believe in helping candidates grow, so we've prepared personalized feedback to help you in your future applications. 
          The detailed feedback report is attached to this email.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
          <h4 className="font-medium text-gray-900 mb-2">Your Feedback Highlights:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {candidate.feedback_highlights?.length ? (
              candidate.feedback_highlights.map((highlight: string, index: number) => (
                <li key={index}>• {highlight}</li>
              ))
            ) : (
              <li>• No feedback highlights available</li>
            )}
          </ul>
        </div>

        <p>
          We've also included personalized course recommendations to help you strengthen your skills. 
          Many of these resources are free and from reputable platforms.
        </p>

        <div className="flex space-x-4 my-6">
          <button 
            className="px-4 py-2 text-white rounded-lg"
            style={{ backgroundColor: primaryColor }}
            onClick={() => handleDownloadReport()}
          >
            Download Feedback Report
          </button>
          <button 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Start Learning
          </button>
        </div>

        <p>
          We encourage you to apply again in the future as your skills develop. 
          Thank you again for your interest in {companyName}.
        </p>

        <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
          <p>
            Best regards,<br />
            HR Team<br />
            {companyName}
          </p>
          <p className="mt-4 text-xs text-gray-500">
            If you no longer wish to receive these emails, you can{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">unsubscribe here</a>.
          </p>
        </div>
      </div>
    </div>
  );

  const renderPDFPreview = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
          <span className="text-xl font-bold text-gray-900">{companyName}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Candidate Feedback Report</h2>
        <p className="text-gray-600">Personalized insights for your career growth</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Application Summary</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Candidate:</strong> {candidate.name}</p>
            <p><strong>Position:</strong> {candidate.position}</p>
            <p><strong>Rejection Stage:</strong> {candidate.rejection_stage}</p>
            <p><strong>Date:</strong> {new Date(candidate.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3">Strengths Identified</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {candidate.strengths?.length ? (
              candidate.strengths.map((strength: string, index: number) => (
                <li key={index}>• {strength}</li>
              ))
            ) : (
              <li>• No strengths identified</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3">Areas for Improvement</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {candidate.areas_for_improvement?.length ? (
              candidate.areas_for_improvement.map((area: string, index: number) => (
                <li key={index}>• {area}</li>
              ))
            ) : (
              <li>• No areas for improvement identified</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3">Recommended Learning Path</h3>
          <div className="space-y-3">
            {candidate.course_recommendations?.length ? (
              candidate.course_recommendations.map((course: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900">{course.title}</h4>
                  <p className="text-sm text-gray-600">{course.provider}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs ${course.free ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} px-2 py-1 rounded`}>
                      {course.free ? 'Free' : 'Paid'}
                    </span>
                    <span className="text-xs text-gray-500">{course.rating} ⭐ • {course.duration}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">No course recommendations available</div>
            )}
          </div>
        </div>

        <div className="text-center pt-4">
          <button 
            className="px-6 py-2 text-white rounded-lg"
            style={{ backgroundColor: primaryColor }}
          >
            Start Learning Journey
          </button>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: primaryColor }} />
          <span className="font-medium text-gray-900">{companyName}</span>
        </div>
        <p className="text-xs text-gray-500">
          Generated by Xact Feedback • Confidential
        </p>
      </div>
    </div>
  );

  const handleDownloadReport = () => {
    // Create a mock PDF content
    const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Xact Feedback Report) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback_report_sample.pdf';
    a.click();
    window.URL.revokeObjectURL(url);

    setDownloadCount(prev => prev + 1);
    
    addNotification({
      type: 'success',
      title: 'PDF Downloaded',
      message: 'Sample feedback report has been downloaded successfully'
    });
  };

  const handleDownloadSamplePDF = () => {
    handleDownloadReport();
  };

  const handleSendTestEmail = () => {
    addNotification({
      type: 'success',
      title: 'Test Email Sent',
      message: 'Test email has been sent to your configured email address'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Preview & Test</h3>
        <p className="text-sm text-gray-600 mt-1">
          Preview how your feedback emails and PDFs will look to candidates
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewType('email')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              previewType === 'email'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Email Preview
          </button>
          <button
            onClick={() => setPreviewType('pdf')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              previewType === 'pdf'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            PDF Preview
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleSendTestEmail}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <Send className="w-4 h-4 inline mr-2" />
            Send Test Email
          </button>
          <button 
            onClick={handleDownloadSamplePDF}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Download Sample PDF
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center space-x-2 mb-4">
          <Eye className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">
            {previewType === 'email' ? 'Email Preview' : 'PDF Preview'}
          </h4>
        </div>
        
        <div className="overflow-auto">
          {previewType === 'email' ? renderEmailPreview() : renderPDFPreview()}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Preview Notes</h4>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-blue-800">PDF Downloads Today:</span>
          <div className="flex items-center space-x-1">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">{downloadCount}</span>
          </div>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• This preview uses sample data for demonstration</li>
          <li>• Actual emails will include personalized AI-generated content</li>
          <li>• Course recommendations will be tailored to each candidate</li>
          <li>• Colors and branding will reflect your company settings</li>
        </ul>
      </div>
    </div>
  );
};
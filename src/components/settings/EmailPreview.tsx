import React, { useState } from 'react';
import { Eye, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const EmailPreview: React.FC = () => {
  const { primaryColor, secondaryColor, companyName } = useTheme();
  const [previewType, setPreviewType] = useState<'email' | 'pdf'>('email');
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  const mockCandidate = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    position: 'Senior Frontend Developer',
    rejectionStage: 'Technical Interview'
  };

  const handlePdfLoad = () => {
    setPdfLoaded(true);
    setPdfError(false);
  };

  const handlePdfError = () => {
    setPdfError(true);
    setPdfLoaded(false);
  };

  const renderEmailPreview = () => (
    <div className="neumorphic-card max-w-2xl mx-auto">
      <div className="border border-shadow/20 rounded-xl p-6 bg-white">
        <div className="border-b border-shadow/20 pb-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span className="font-medium text-gray-900">{companyName}</span>
            </div>
            <span className="text-sm text-gray-500">hr@{companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Thank you for your application - {mockCandidate.name}
          </h3>
        </div>

        <div className="prose prose-sm max-w-none">
          <p>Dear {mockCandidate.name},</p>
          
          <p>
            Thank you for your interest in the <strong>{mockCandidate.position}</strong> position at {companyName}. 
            While we were impressed with your background and experience, we have decided to move forward with another candidate.
          </p>

          <div className="neumorphic-card p-4 my-4 bg-primary-50">
            <h4 className="font-medium text-primary-900 mb-2">Your Feedback Highlights:</h4>
            <ul className="text-sm text-primary-800 space-y-1">
              <li>• Strong technical skills in React and TypeScript</li>
              <li>• Excellent problem-solving approach</li>
              <li>• Room for improvement in system design concepts</li>
              <li>• Consider exploring backend technologies</li>
            </ul>
          </div>

          <p>
            We've also included personalized course recommendations to help you strengthen your skills. 
            Many of these resources are free and from reputable platforms.
          </p>

          <div className="flex space-x-4 my-6 justify-center">
            <button 
              className="neumorphic-btn-primary px-4 py-2 text-sm"
              style={{ backgroundColor: primaryColor }}
            >
              Download Feedback Report
            </button>
            <button className="neumorphic-btn px-4 py-2 text-sm border border-shadow">
              Start Learning
            </button>
          </div>

          <p>
            We encourage you to apply again in the future as your skills develop. 
            Thank you again for your interest in {companyName}.
          </p>

          <div className="mt-6 pt-4 border-t border-shadow/20 text-sm text-gray-600">
            <p>
              Best regards,<br />
              HR Team<br />
              {companyName}
            </p>
            <p className="mt-4 text-xs text-gray-500">
              If you no longer wish to receive these emails, you can{' '}
              <a href="#" className="text-primary-600 hover:text-primary-800">unsubscribe here</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPDFPreview = () => (
    <div className="neumorphic-card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
             style={{ backgroundColor: primaryColor }}>
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">PDF Feedback Report</h3>
        <p className="text-gray-600">Interactive 2-page personalized feedback</p>
      </div>

      <div className="neumorphic-card p-6 bg-background-light">
        {!pdfError ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-shadow">
              {pdfLoaded ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">PDF Preview Loaded</p>
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Loading PDF preview...</p>
                  <button 
                    onClick={handlePdfLoad}
                    className="neumorphic-btn mt-2 px-4 py-2 text-sm"
                  >
                    Load Preview
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="neumorphic-card p-3">
                <h4 className="font-medium text-gray-800 mb-2">Page 1 - Feedback</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Personalized greeting</li>
                  <li>• Skill gap analysis</li>
                  <li>• Resume improvement tips</li>
                  <li>• Motivational message</li>
                </ul>
              </div>
              <div className="neumorphic-card p-3">
                <h4 className="font-medium text-gray-800 mb-2">Page 2 - Learning</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• 3 free course recommendations</li>
                  <li>• 3 premium course options</li>
                  <li>• Interactive CTA buttons</li>
                  <li>• Company branding</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="font-medium text-gray-800 mb-2">PDF Preview Unavailable</h4>
            <p className="text-gray-600 mb-4">
              Unable to load PDF preview. The actual PDF will be generated when sending feedback.
            </p>
            <button 
              onClick={() => setPdfError(false)}
              className="neumorphic-btn px-4 py-2 text-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="text-center mt-6">
        <button className="neumorphic-btn-primary px-6 py-3 flex items-center space-x-2 mx-auto">
          <Download className="w-4 h-4" />
          <span>Download Sample PDF</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Email & PDF Preview</h3>
        <p className="text-sm text-gray-600 mt-1">
          Preview how your feedback emails and PDFs will look to candidates
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setPreviewType('email')}
          className={`neumorphic-tab px-4 py-2 text-sm font-medium transition-all ${
            previewType === 'email' ? 'neumorphic-tab-active' : ''
          }`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Email Preview
        </button>
        <button
          onClick={() => setPreviewType('pdf')}
          className={`neumorphic-tab px-4 py-2 text-sm font-medium transition-all ${
            previewType === 'pdf' ? 'neumorphic-tab-active' : ''
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          PDF Preview
        </button>
      </div>

      <div className="neumorphic-card p-6 bg-background-light">
        {previewType === 'email' ? renderEmailPreview() : renderPDFPreview()}
      </div>
    </div>
  );
};
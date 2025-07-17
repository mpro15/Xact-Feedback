import React, { useState } from 'react';
import { X, User, Mail, Briefcase, Calendar, FileText, Send, Edit, Download, Zap } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

interface CandidateModalProps {
  candidate: any;
  onClose: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({ candidate, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [candidateData, setCandidateData] = useState(candidate);

  const tabs = [
    { id: 'details', label: 'Candidate Details', icon: User },
    { id: 'feedback', label: 'AI Feedback', icon: FileText },
    { id: 'email', label: 'Email Preview', icon: Mail },
    { id: 'analytics', label: 'Analytics', icon: Calendar }
  ];

  const handleFeedbackSuccess = () => {
    setCandidateData(prev => ({ ...prev, feedback_status: 'sent' }));
    setShowFeedbackModal(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-sm text-gray-900">{candidateData.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-sm text-gray-900">{candidateData.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position Applied</label>
                <p className="text-sm text-gray-900">{candidateData.position}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Stage</label>
                <p className="text-sm text-gray-900">{candidateData.rejectionStage}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
                <p className="text-sm text-gray-900">{candidateData.appliedDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  candidate.status === 'Sent' ? 'bg-green-100 text-green-800' :
                  candidate.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                } neumorphic-badge`}>
                  {candidate.status}
                </span>
              </div>
            </div>
          </div>
        );
      
      case 'feedback':
        return (
          <div className="space-y-6">
            <div className="neumorphic-card p-4 bg-primary-50">
              <h4 className="font-medium text-primary-900 mb-2">AI-Generated Feedback Summary</h4>
              <p className="text-sm text-primary-800">
                Based on the candidate's application and rejection at the {candidateData.rejectionStage} stage, 
                we've identified key areas for improvement and personalized recommendations.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Strengths Identified</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Strong technical background in frontend development</li>
                  <li>• Excellent communication skills during interviews</li>
                  <li>• Relevant experience with React and TypeScript</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• System design knowledge needs enhancement</li>
                  <li>• Limited experience with large-scale applications</li>
                  <li>• Could benefit from more backend development exposure</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommended Courses</h4>
                <div className="space-y-2">
                  <div className="neumorphic-card p-3">
                    <h5 className="font-medium text-gray-900">System Design Fundamentals</h5>
                    <p className="text-sm text-gray-600">Grokking the System Design Interview - educative.io</p>
                    <span className="text-xs text-blue-600">Free • 4.5 ⭐ • 40 hours</span>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <h5 className="font-medium text-gray-900">Advanced React Patterns</h5>
                    <p className="text-sm text-gray-600">Advanced React - Frontend Masters</p>
                    <span className="text-xs text-blue-600">Paid • 4.8 ⭐ • 6 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'email':
        return (
          <div className="space-y-6">
            <div className="neumorphic-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Email Preview</h4>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    <Edit className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm">
                    <Send className="w-4 h-4 inline mr-1" />
                    Send
                  </button>
                </div>
              </div>
              
              <div className="neumorphic-card p-4 text-sm bg-background-light">
                <div className="mb-4">
                  <p><strong>From:</strong> hr@techcorp.com</p>
                  <p><strong>To:</strong> {candidateData.email}</p>
                  <p><strong>Subject:</strong> Thank you for your application - Feedback enclosed</p>
                </div>
                
                <div className="prose text-sm">
                  <p>Dear {candidateData.name},</p>
                  <p>Thank you for your interest in the {candidateData.position} position at TechCorp Inc. While we were impressed with your background and experience, we have decided to move forward with another candidate.</p>
                  <p>We believe in helping candidates grow, so we've prepared personalized feedback to help you in your future applications. Please find the detailed feedback report attached.</p>
                  <p>We encourage you to apply again in the future as your skills develop.</p>
                  <p>Best regards,<br />HR Team<br />TechCorp Inc.</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="neumorphic-card p-4 bg-primary-50">
                <h4 className="font-medium text-primary-900 mb-2">Email Opens</h4>
                <p className="text-2xl font-bold text-primary-900">{candidateData.openRate || 0}</p>
                <p className="text-sm text-primary-600">Last opened: N/A</p>
              </div>
              <div className="neumorphic-card p-4 bg-green-50">
                <h4 className="font-medium text-green-900 mb-2">Link Clicks</h4>
                <p className="text-2xl font-bold text-green-900">{candidate.clickRate}</p>
                <p className="text-sm text-green-600">Most clicked: Course links</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Engagement Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Email sent</span>
                  <span className="text-sm text-gray-500">2024-01-15 10:30 AM</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Email opened</span>
                  <span className="text-sm text-gray-500">Not yet</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Links clicked</span>
                  <span className="text-sm text-gray-500">Not yet</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="neumorphic-modal max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-shadow/20 bg-gradient-to-r from-background-light to-background">
          <h2 className="text-xl font-semibold text-gray-800">
            Candidate: {candidateData.name}
          </h2>
          <button
            onClick={onClose}
            className="neumorphic-btn p-3"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-shadow/20 bg-background-light">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] bg-background">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-shadow/20 bg-background-light">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowFeedbackModal(true)}
              className="neumorphic-btn-primary px-4 py-2 flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Generate Feedback</span>
            </button>
            <button className="neumorphic-btn px-4 py-2 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
          <button 
            onClick={onClose}
            className="neumorphic-btn px-4 py-2 text-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    <FeedbackModal
      isOpen={showFeedbackModal}
      onClose={() => setShowFeedbackModal(false)}
      candidate={candidateData}
      onSuccess={handleFeedbackSuccess}
    />
    </>
  );
};
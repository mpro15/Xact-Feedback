import React, { useState, useEffect } from 'react';
import { X, Send, FileText, Download, Eye, CheckCircle, AlertCircle, Edit, Save, RefreshCw } from 'lucide-react';
import { FeedbackService } from '../../services/feedbackService';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  onSuccess?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSuccess
}) => {
  const { addNotification } = useNotification();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFeedback, setGeneratedFeedback] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('preview');
  
  // New states for AI feedback modification
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string>('');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [editedFeedback, setEditedFeedback] = useState<string>('');
  const [feedbackHighlights, setFeedbackHighlights] = useState<string[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Load any existing feedback if available
  useEffect(() => {
    if (candidate?.id) {
      fetchExistingFeedback();
    }
  }, [candidate]);

  const fetchExistingFeedback = async () => {
    try {
      const { data } = await FeedbackService.getFeedbackDraft(candidate.id);
      if (data) {
        setAiGeneratedContent(data.content || '');
        setEditedFeedback(data.content || '');
        setFeedbackHighlights(data.highlights || []);
      }
    } catch (error) {
      console.error('Error fetching existing feedback:', error);
    }
  };

  if (!isOpen) return null;

  const handleGenerateFeedback = async () => {
    setIsGenerating(true);
    try {
      // First generate AI feedback if not already available
      if (!aiGeneratedContent) {
        const jobDescription = `${candidate.position} position requiring experience in ${candidate.rejection_stage.toLowerCase()}`;
        const aiResult = await FeedbackService.generateFeedback(candidate.id, jobDescription);
        
        if (aiResult) {
          setAiGeneratedContent(aiResult.summary || '');
          setEditedFeedback(aiResult.summary || '');
          
          // Extract highlights from the feedback content
          const highlights = extractHighlightsFromContent(aiResult.summary || '');
          setFeedbackHighlights(highlights);
        }
      }
      
      // Then proceed with sending feedback
      const result = await FeedbackService.generateAndSendFeedback(candidate.id, editedFeedback, feedbackHighlights);
      
      if (result.success) {
        setGeneratedFeedback({
          pdf_url: result.pdf_url,
          feedback_report_id: result.feedback_report_id
        });
        
        addNotification({
          type: 'success',
          title: 'Feedback Sent Successfully',
          message: `Feedback email sent to ${candidate.name} with PDF attachment`
        });
        
        onSuccess?.();
      } else {
        addNotification({
          type: 'error',
          title: 'Failed to Send Feedback',
          message: result.message
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while generating feedback'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Function to extract highlights from the feedback content
  const extractHighlightsFromContent = (content: string): string[] => {
    const lines = content.split('\n');
    const highlights = lines
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
      .map(line => line.trim().replace(/^[•-]\s*/, ''))
      .filter(highlight => highlight.length > 0)
      .slice(0, 5); // Limit to 5 highlights
      
    return highlights.length > 0 ? highlights : ['Feedback provided based on your application'];
  };
  
  // Function to handle editing the AI-generated feedback
  const handleEditFeedback = () => {
    setIsEditingFeedback(true);
  };
  
  // Function to save the edited feedback
  const handleSaveFeedback = async () => {
    setIsSavingEdit(true);
    try {
      // Save the edited feedback and highlights
      await FeedbackService.saveFeedbackDraft(
        candidate.id,
        editedFeedback,
        feedbackHighlights
      );
      
      addNotification({
        type: 'success',
        title: 'Feedback Saved',
        message: 'Your edits to the feedback have been saved'
      });
      
      setIsEditingFeedback(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save your feedback edits'
      });
    } finally {
      setIsSavingEdit(false);
    }
  };
  
  // Function to regenerate AI feedback
  const handleRegenerateFeedback = async () => {
    setIsGenerating(true);
    try {
      const jobDescription = `${candidate.position} position requiring experience in ${candidate.rejection_stage.toLowerCase()}`;
      const aiResult = await FeedbackService.generateFeedback(candidate.id, jobDescription);
      
      if (aiResult) {
        setAiGeneratedContent(aiResult.summary || '');
        setEditedFeedback(aiResult.summary || '');
        
        // Extract highlights from the feedback content
        const highlights = extractHighlightsFromContent(aiResult.summary || '');
        setFeedbackHighlights(highlights);
        
        addNotification({
          type: 'success',
          title: 'Feedback Regenerated',
          message: 'AI feedback has been regenerated successfully'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Regeneration Failed',
        message: 'Failed to regenerate AI feedback'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: 'preview', label: 'Email Preview', icon: Eye },
    { id: 'pdf', label: 'PDF Report', icon: FileText },
    { id: 'edit', label: 'Edit AI Feedback', icon: Edit },
    { id: 'settings', label: 'Settings', icon: CheckCircle }
  ];

  // UI for editing AI-generated feedback
  const renderFeedbackEditor = () => (
    <div className="neumorphic-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Edit AI-Generated Feedback</h3>
        <p className="text-sm text-gray-600">
          Modify the AI-generated feedback to better match your company's voice and tone.
          This feedback will be sent to {candidate.name}.
        </p>
      </div>

      {aiGeneratedContent ? (
        <div className="space-y-6">          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Content
            </label>
            <div className="relative">
              <textarea
                value={editedFeedback}
                onChange={(e) => setEditedFeedback(e.target.value)}
                rows={12}
                className={`neumorphic-input w-full font-mono text-sm ${isSavingEdit ? 'bg-gray-50' : 'bg-white'}`}
                disabled={isSavingEdit}
                placeholder="Enter personalized feedback for the candidate here..."
              />
              {editedFeedback !== aiGeneratedContent && (
                <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md">
                  Edited
                </span>
              )}
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                Tips: Be specific, constructive, and encouraging. Use bullet points for clarity.
              </p>
              <p className="text-xs text-gray-500">
                {editedFeedback.length} characters
              </p>
            </div>
          </div>          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Key Highlights (Up to 5)</span>
              <span className="text-xs text-gray-500">{feedbackHighlights.length}/5 highlights</span>
            </label>
            <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {feedbackHighlights.map((highlight, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500 w-5">{index + 1}.</span>
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => {
                      const newHighlights = [...feedbackHighlights];
                      newHighlights[index] = e.target.value;
                      setFeedbackHighlights(newHighlights);
                    }}
                    className="neumorphic-input flex-grow mb-2"
                    placeholder={`Highlight #${index + 1}`}
                    disabled={isSavingEdit}
                  />
                  {feedbackHighlights.length > 1 && (
                    <button
                      onClick={() => {
                        const newHighlights = [...feedbackHighlights];
                        newHighlights.splice(index, 1);
                        setFeedbackHighlights(newHighlights);
                      }}
                      className="text-red-500 hover:text-red-700"
                      disabled={isSavingEdit}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {feedbackHighlights.length < 5 && (
                <button
                  onClick={() => setFeedbackHighlights([...feedbackHighlights, ''])}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  disabled={isSavingEdit}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add highlight
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              These highlights will be featured prominently in the feedback email and PDF.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleRegenerateFeedback}
              disabled={isGenerating}
              className="neumorphic-btn px-4 py-2 flex items-center space-x-2 text-gray-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Regenerate with AI</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSaveFeedback}
              disabled={isSavingEdit}
              className="neumorphic-btn-primary px-4 py-2 flex items-center space-x-2"
            >
              {isSavingEdit ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-6">No AI feedback has been generated yet.</p>
          <button
            onClick={handleRegenerateFeedback}
            disabled={isGenerating}
            className="neumorphic-btn-primary px-6 py-3 flex items-center space-x-2 mx-auto"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Generate Feedback with AI</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  const renderEmailPreview = () => (
    <div className="neumorphic-card p-6">
      <div className="border border-shadow/20 rounded-xl p-6 bg-white">
        <div className="mb-4 pb-4 border-b border-shadow/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full" />
              <span className="font-semibold text-gray-800">Your Company</span>
            </div>
            <span className="text-sm text-gray-500">hr@company.com</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Thank you for your application - {candidate.name}
          </h3>
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700">Dear {candidate.name},</p>
          
          <p className="text-gray-700">
            Thank you for your interest in the <strong>{candidate.position}</strong> position at Your Company. 
            While we were impressed with your background and experience, we have decided to move forward with another candidate.
          </p>

          <div className="neumorphic-card p-4 my-4 bg-primary-50">
            <h4 className="font-semibold text-primary-800 mb-2">Our Commitment to Your Growth</h4>
            <p className="text-primary-700 text-sm">
              We believe in helping candidates grow, so we've prepared personalized feedback to help you in your future applications. 
              The detailed feedback report is attached to this email.
            </p>
          </div>

          <div className="neumorphic-card p-4 my-4">
            <h4 className="font-semibold text-gray-800 mb-2">Key Areas for Development:</h4>
            <div className="flex flex-wrap gap-2">
              <span className="neumorphic-badge bg-primary-100 text-primary-800 text-xs">Advanced React patterns</span>
              <span className="neumorphic-badge bg-primary-100 text-primary-800 text-xs">System design</span>
              <span className="neumorphic-badge bg-primary-100 text-primary-800 text-xs">Testing frameworks</span>
            </div>
          </div>

          <div className="neumorphic-card p-4 my-4 bg-blue-50 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <strong className="text-blue-900">Detailed Feedback Report Attached</strong>
            </div>
            <p className="text-blue-800 text-sm">
              We've prepared a comprehensive 2-page PDF report with personalized recommendations, 
              course suggestions, and actionable next steps.
            </p>
          </div>

          <div className="flex space-x-4 my-6 justify-center">
            <button className="neumorphic-btn-primary px-4 py-2 text-sm">
              🔧 Improve Resume
            </button>
            <button className="neumorphic-btn-primary px-4 py-2 text-sm">
              📚 Start Learning
            </button>
            <button className="neumorphic-btn-primary px-4 py-2 text-sm">
              🔄 Future Opportunities
            </button>
          </div>

          <p className="text-gray-700">
            We encourage you to apply again in the future as your skills develop. 
            Thank you again for your interest in Your Company.
          </p>

          <div className="mt-6 pt-4 border-t border-shadow/20 text-sm text-gray-600">
            <p>
              Best regards,<br />
              HR Team<br />
              Your Company
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPDFPreview = () => (
    <div className="neumorphic-card p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-neumorphic">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Interactive PDF Report</h3>
        <p className="text-gray-600">2-page personalized feedback document</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="neumorphic-card p-4">
          <h4 className="font-semibold text-gray-800 mb-3">📄 Page 1 - Feedback Summary</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Personalized greeting and summary</li>
            <li>• Rejection reason explanation</li>
            <li>• Key skill gaps identified</li>
            <li>• Resume improvement tips</li>
            <li>• Motivational message</li>
            <li>• Action buttons (Fix Resume, Start Learning)</li>
          </ul>
        </div>

        <div className="neumorphic-card p-4">
          <h4 className="font-semibold text-gray-800 mb-3">📚 Page 2 - Learning Path</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• 3 free course recommendations</li>
            <li>• 3 premium course options</li>
            <li>• Course ratings and providers</li>
            <li>• Direct enrollment links</li>
            <li>• Next steps checklist</li>
            <li>• Company branding and footer</li>
          </ul>
        </div>
      </div>

      <div className="neumorphic-card p-4 bg-green-50">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-green-800">PDF Features</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <p>✅ Interactive buttons and links</p>
            <p>✅ Company branding applied</p>
            <p>✅ Mobile-friendly design</p>
          </div>
          <div>
            <p>✅ Optimized file size (&lt;1MB)</p>
            <p>✅ Professional layout</p>
            <p>✅ Personalized content</p>
          </div>
        </div>
      </div>

      {generatedFeedback?.pdf_url && (
        <div className="text-center mt-6">
          <a
            href={generatedFeedback.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="neumorphic-btn-primary px-6 py-3 inline-flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Generated PDF</span>
          </a>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="neumorphic-card p-6 space-y-6">
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Email Configuration</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
            <input
              type="text"
              defaultValue="HR Team"
              className="neumorphic-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
            <input
              type="email"
              defaultValue="hr@company.com"
              className="neumorphic-input w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-3">PDF Settings</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input type="checkbox" defaultChecked className="neumorphic-input" />
            <span className="text-sm text-gray-700">Include company logo</span>
          </label>
          <label className="flex items-center space-x-3">
            <input type="checkbox" defaultChecked className="neumorphic-input" />
            <span className="text-sm text-gray-700">Apply company branding colors</span>
          </label>
          <label className="flex items-center space-x-3">
            <input type="checkbox" defaultChecked className="neumorphic-input" />
            <span className="text-sm text-gray-700">Include interactive buttons</span>
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Course Recommendations</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Free Courses</label>
            <select className="neumorphic-input w-full">
              <option>3 courses (recommended)</option>
              <option>2 courses</option>
              <option>4 courses</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Premium Courses</label>
            <select className="neumorphic-input w-full">
              <option>3 courses (recommended)</option>
              <option>2 courses</option>
              <option>4 courses</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="neumorphic-modal max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-shadow/20 bg-gradient-to-r from-background-light to-background">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Generate Feedback</h2>
            <p className="text-gray-600">Create personalized feedback for {candidate.name}</p>
          </div>
          <button
            onClick={onClose}
            className="neumorphic-btn p-3"
          >
            <X className="w-6 h-6 text-gray-600" />
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
          {activeTab === 'preview' && renderEmailPreview()}
          {activeTab === 'pdf' && renderPDFPreview()}
          {activeTab === 'edit' && renderFeedbackEditor()}
          {activeTab === 'settings' && renderSettings()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-shadow/20 bg-background-light">
          <div className="flex items-center space-x-2">
            {generatedFeedback ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Feedback sent successfully!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">Ready to generate and send feedback</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="neumorphic-btn px-4 py-2 text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateFeedback}
              disabled={isGenerating || generatedFeedback}
              className="neumorphic-btn-primary px-6 py-2 flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Generating...</span>
                </>
              ) : generatedFeedback ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Sent</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Generate & Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
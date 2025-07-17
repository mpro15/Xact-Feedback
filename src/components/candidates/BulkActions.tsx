import React, { useState } from 'react';
import { Send, Edit, Trash2, Download, X, AlertCircle, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useNotification } from '../../contexts/NotificationContext';

interface BulkActionsProps {
  selectedCount: number;
  onClear: () => void;
  onSendFeedback: () => Promise<void>;
  onEditTemplates: () => void;
  onExport: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({ 
  selectedCount, 
  onClear, 
  onSendFeedback, 
  onEditTemplates, 
  onExport 
}) => {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleSendFeedback = async () => {
    if (selectedCount === 0) return;

    setIsLoading(true);
    setProgress({ current: 0, total: selectedCount });

    try {
      // Simulate progress for bulk sending
      for (let i = 0; i < selectedCount; i++) {
        setProgress({ current: i + 1, total: selectedCount });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      }

      await onSendFeedback();
      
      addNotification({
        type: 'success',
        title: 'Bulk Feedback Sent',
        message: `Successfully sent feedback to ${selectedCount} candidate${selectedCount > 1 ? 's' : ''}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Bulk Send Failed',
        message: `Failed to send feedback to some candidates. Please try again.`
      });
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="neumorphic-card p-4 bg-primary-50 border border-primary-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-primary-900">
              {selectedCount} candidate{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>
          
          {isLoading && (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="small" />
              <span className="text-sm text-primary-700">
                Sending {progress.current}/{progress.total}...
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleSendFeedback}
            disabled={isLoading}
            className="neumorphic-btn-primary px-4 py-2 text-sm flex items-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Send Feedback</span>
          </button>
          
          <button 
            onClick={onEditTemplates}
            disabled={isLoading}
            className="neumorphic-btn px-3 py-2 text-sm flex items-center space-x-1 text-primary-600 hover:text-primary-800"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Templates</span>
          </button>
          
          <button 
            onClick={onExport}
            disabled={isLoading}
            className="neumorphic-btn px-3 py-2 text-sm flex items-center space-x-1 text-primary-600 hover:text-primary-800"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button 
            onClick={onClear}
            disabled={isLoading}
            className="neumorphic-btn p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4">
          <div className="neumorphic-progress h-2">
            <div 
              className="neumorphic-progress-fill h-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Settings, BarChart3 } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const actions = [
    {
      title: 'Generate Feedback',
      description: 'Create AI-powered feedback for candidates',
      icon: Plus,
      color: 'from-primary-400 to-primary-600',
      action: () => {
        navigate('/candidates');
        addNotification({
          type: 'info',
          title: 'Generate Feedback',
          message: 'Redirecting to candidates page to generate feedback'
        });
      }
    },
    {
      title: 'Preview Email',
      description: 'Review email templates before sending',
      icon: FileText,
      color: 'from-green-400 to-green-600',
      action: () => {
        navigate('/settings');
        addNotification({
          type: 'info',
          title: 'Email Preview',
          message: 'Opening email preview in settings'
        });
      }
    },
    {
      title: 'Settings',
      description: 'Update branding and preferences',
      icon: Settings,
      color: 'from-blue-400 to-blue-600',
      action: () => {
        navigate('/settings');
        addNotification({
          type: 'info',
          title: 'Settings',
          message: 'Opening settings panel'
        });
      }
    },
    {
      title: 'View Analytics',
      description: 'Check email performance metrics',
      icon: BarChart3,
      color: 'from-purple-400 to-purple-600',
      action: () => {
        navigate('/analytics');
        addNotification({
          type: 'info',
          title: 'Analytics',
          message: 'Opening analytics dashboard'
        });
      }
    }
  ];

  return (
    <div className="neumorphic-card">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="space-y-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="w-full neumorphic-btn p-4 text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center shadow-neumorphic-sm group-hover:shadow-neumorphic transition-all duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 group-hover:text-primary-700 transition-colors duration-300">{action.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
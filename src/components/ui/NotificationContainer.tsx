import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-primary-600" />;
      default:
        return <Info className="w-5 h-5 text-primary-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-primary-50 border-primary-200';
      default:
        return 'bg-background border-shadow';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`neumorphic-notification p-4 transform transition-all duration-500 hover:scale-105 ${getBackgroundColor(notification.type)} notification-enter notification-enter-active`}
        >
          <div className="flex items-start space-x-3">
            <div className="neumorphic-stat w-10 h-10 flex items-center justify-center">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">{notification.title}</h4>
              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="neumorphic-btn p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
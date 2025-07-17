import React, { useState } from 'react';
import { Plus, Trash2, Edit, RefreshCw, Copy, CheckCircle, XCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export const WebhookIntegrations: React.FC = () => {
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [],
    secret: ''
  });

  const [webhooks, setWebhooks] = useState([
    {
      id: 'webhook-1',
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/T1234567/B1234567/abcdefghijklmnopqrstuvwx',
      events: ['feedback.sent', 'feedback.opened', 'feedback.clicked'],
      status: 'active',
      lastTriggered: '2024-01-15 10:30 AM',
      deliveries: 1247,
      failures: 3
    },
    {
      id: 'webhook-2',
      name: 'Analytics Tracker',
      url: 'https://analytics.company.com/webhook/xact-feedback',
      events: ['feedback.sent', 'candidate.rejected'],
      status: 'active',
      lastTriggered: '2024-01-15 10:28 AM',
      deliveries: 892,
      failures: 0
    },
    {
      id: 'webhook-3',
      name: 'CRM Integration',
      url: 'https://crm.company.com/api/webhooks/feedback',
      events: ['feedback.sent', 'feedback.opened', 'course.enrolled'],
      status: 'inactive',
      lastTriggered: '2024-01-10 03:15 PM',
      deliveries: 456,
      failures: 12
    }
  ]);

  const eventTypes = [
    { id: 'feedback.sent', label: 'Feedback Sent', description: 'When feedback email is sent to candidate' },
    { id: 'feedback.opened', label: 'Feedback Opened', description: 'When candidate opens feedback email' },
    { id: 'feedback.clicked', label: 'Feedback Clicked', description: 'When candidate clicks links in feedback' },
    { id: 'candidate.rejected', label: 'Candidate Rejected', description: 'When candidate is rejected from position' },
    { id: 'course.enrolled', label: 'Course Enrolled', description: 'When candidate enrolls in recommended course' },
    { id: 'candidate.reapplied', label: 'Candidate Re-applied', description: 'When candidate applies again after feedback' }
  ];

  const handleAddWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsLoading('add');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const webhook = {
        id: `webhook-${Date.now()}`,
        name: newWebhook.name,
        url: newWebhook.url,
        events: newWebhook.events,
        status: 'active',
        lastTriggered: 'Never',
        deliveries: 0,
        failures: 0
      };
      
      setWebhooks(prev => [...prev, webhook]);
      setNewWebhook({ name: '', url: '', events: [], secret: '' });
      setShowAddForm(false);
      
      addNotification({
        type: 'success',
        title: 'Webhook Added',
        message: 'Webhook has been created successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create webhook. Please try again.'
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
    addNotification({
      type: 'info',
      title: 'Webhook Deleted',
      message: 'Webhook has been removed'
    });
  };

  const handleToggleStatus = (webhookId: string) => {
    setWebhooks(prev => 
      prev.map(webhook => 
        webhook.id === webhookId 
          ? { ...webhook, status: webhook.status === 'active' ? 'inactive' : 'active' }
          : webhook
      )
    );
  };

  const handleTestWebhook = async (webhookId: string) => {
    setIsLoading(webhookId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addNotification({
        type: 'success',
        title: 'Test Successful',
        message: 'Test payload sent successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Test Failed',
        message: 'Failed to send test payload'
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleEventToggle = (eventId: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Webhook Integrations</h3>
          <p className="text-sm text-gray-600 mt-1">
            Set up webhooks to receive real-time notifications about feedback events
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Webhook</span>
        </button>
      </div>

      {/* Add Webhook Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Add New Webhook</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Name
                </label>
                <input
                  type="text"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Slack Notifications"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/webhook"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Events to Subscribe
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eventTypes.map((event) => (
                  <label key={event.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={newWebhook.events.includes(event.id)}
                      onChange={() => handleEventToggle(event.id)}
                      className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{event.label}</span>
                      <p className="text-xs text-gray-500">{event.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secret (Optional)
              </label>
              <input
                type="text"
                value={newWebhook.secret}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Webhook secret for verification"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWebhook}
                disabled={isLoading === 'add'}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading === 'add' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Add Webhook'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{webhook.url}</p>
              </div>
              <div className="flex items-center space-x-2">
                {webhook.status === 'active' ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Inactive</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-700">Deliveries</span>
                <p className="text-lg font-bold text-gray-900">{webhook.deliveries}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-700">Failures</span>
                <p className="text-lg font-bold text-gray-900">{webhook.failures}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-700">Last Triggered</span>
                <p className="text-sm text-gray-900">{webhook.lastTriggered}</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700">Subscribed Events:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {webhook.events.map((event) => (
                  <span
                    key={event}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {eventTypes.find(e => e.id === event)?.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigator.clipboard.writeText(webhook.url)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleTestWebhook(webhook.id)}
                  disabled={isLoading === webhook.id}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {isLoading === webhook.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleStatus(webhook.id)}
                  className={`px-3 py-1 text-sm rounded ${
                    webhook.status === 'active'
                      ? 'text-red-600 hover:text-red-800'
                      : 'text-green-600 hover:text-green-800'
                  }`}
                >
                  {webhook.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDeleteWebhook(webhook.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Webhook Payload Example</h4>
        <pre className="text-sm text-gray-600 bg-white p-3 rounded border overflow-x-auto">
{`{
  "event": "feedback.sent",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "candidate_id": "12345",
    "candidate_name": "John Doe",
    "candidate_email": "john.doe@email.com",
    "position": "Software Engineer",
    "rejection_stage": "Technical Interview",
    "feedback_id": "feedback_67890"
  }
}`}
        </pre>
      </div>
    </div>
  );
};
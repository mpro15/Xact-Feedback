import React from 'react';
import { CreditCard } from 'lucide-react';

const PaymentPendingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Required</h2>
        <p className="text-gray-600 mb-4">
          Please complete your payment to activate your account and continue using Xact Feedback.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentPendingPage;

import React from 'react';

const PaymentPendingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="neumorphic-card p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Required</h1>
        <p className="text-gray-600 mb-6">
          Your subscription is not active. Please complete payment to access the platform features.
        </p>
        <a href="/billing" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Go to Payment</a>
      </div>
    </div>
  );
};

export default PaymentPendingPage;

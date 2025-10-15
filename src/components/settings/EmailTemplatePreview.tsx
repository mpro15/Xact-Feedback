import React from 'react';

interface EmailTemplatePreviewProps {
  logo: string | null;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  subjectTemplate: string;
  emailSignature: string;
  unsubscribeText: string;
  candidateName?: string;
  position?: string;
  rejectionStage?: string;
}

export const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({
  logo,
  companyName,
  primaryColor,
  secondaryColor,
  senderName,
  senderEmail,
  emailSignature,
  unsubscribeText,
  candidateName = "John Smith",
  position = "Software Engineer",
  rejectionStage = "Technical Interview"
}) => {  // Parse the email signature to preserve line breaks
  // Fix the newline handling issue by properly handling both \n and \\n
  const formattedSignature = emailSignature
    .replace(/\\n/g, '<br />')
    .replace(/\n/g, '<br />');

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Email Header */}
      <div className="border-b border-gray-200 p-4" style={{ backgroundColor: primaryColor + '10' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            {logo && (
              <img
                src={logo}
                alt="Company Logo"
                className="w-8 h-8 object-contain"
              />
            )}
            <span className="font-medium" style={{ color: primaryColor }}>
              {companyName}
            </span>
          </div>
          <span className="text-sm text-gray-500">{senderEmail}</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          Thank you for your application - {candidateName}
        </h3>
      </div>

      {/* Email Body */}
      <div className="p-6 space-y-4">
        <p className="text-gray-700">
          Dear {candidateName},
        </p>

        <p className="text-gray-700">
          Thank you for your interest in the <span className="font-medium">{position}</span> position at {companyName}. 
          After careful consideration of your application, we've decided to move forward with other candidates who more closely match our current requirements at the {rejectionStage} stage.
        </p>

        {/* Feedback Highlights Section */}
        <div 
          className="p-4 rounded-md space-y-2 border"
          style={{ backgroundColor: primaryColor + '10', borderColor: primaryColor + '30' }}
        >
          <h4 className="font-medium" style={{ color: primaryColor }}>Your Feedback Highlights:</h4>
          <ul className="space-y-1 text-gray-700">
            <li>• Strong communication skills demonstrated during the interview</li>
            <li>• Excellent problem-solving approach to technical challenges</li>
            <li>• Consider gaining more experience with cloud infrastructure</li>
            <li>• Further development of system design skills recommended</li>
          </ul>
        </div>        <p className="text-gray-700">
          Based on your application and feedback from our hiring team, we've included personalized course recommendations in the attached PDF report to help you strengthen relevant skills for similar positions.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex space-x-4 my-6 justify-center">
          <button 
            className="px-4 py-2 rounded text-white font-medium text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            Download Full Feedback
          </button>
          <button 
            className="px-4 py-2 rounded font-medium text-sm border"
            style={{ color: secondaryColor, borderColor: secondaryColor }}
          >
            View Course Recommendations
          </button>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 mb-4">
          <strong>Note:</strong> This feedback is automatically generated based on your application and interview performance data from our applicant tracking system.
        </div>        <p className="text-gray-700">
          We appreciate your interest in {companyName} and encourage you to apply for future positions that match your qualifications as you continue to grow in your career.
        </p>

        {/* Similar Job Suggestions */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Similar Jobs You May Be Interested In</h4>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-gray-900">{position} {i}</h5>
                    <p className="text-sm text-gray-600">Company {i} • Remote • Full-time</p>
                  </div>
                  <button 
                    className="px-3 py-1 text-xs text-white rounded-md"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Signature */}
        <div className="pt-6 border-t border-gray-200">
          <div 
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: formattedSignature }}
          />
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-gray-200 text-xs text-gray-500">
          <p>{unsubscribeText}</p>
          <p className="mt-2">© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

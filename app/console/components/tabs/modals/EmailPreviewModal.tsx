"use client";

import InviteEmailTemplate from "../mockups/InviteEmailTemplate";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  recipientEmail: string;
  inviterName: string;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  projectName,
  recipientEmail,
  inviterName,
}: EmailPreviewModalProps) {
  if (!isOpen) return null;

  // Create a mock invite URL
  const inviteUrl = `http://localhost:3000/verify-email?token=sample-token-123&project_id=sample-project-id`;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-4 w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-lg font-medium text-gray-900">
            Email Preview: Invitation to {recipientEmail}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This is a preview of the email that will be sent to{" "}
                  <strong>{recipientEmail}</strong>. The actual email may look
                  slightly different depending on the recipient&apos;s email
                  client.
                </p>
              </div>
            </div>
          </div>

          <InviteEmailTemplate
            projectName={projectName}
            inviterName={inviterName}
            inviteUrl={inviteUrl}
          />

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

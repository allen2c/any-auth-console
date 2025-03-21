"use client";

interface InviteEmailTemplateProps {
  projectName: string;
  inviterName: string;
  inviteUrl: string;
}

export default function InviteEmailTemplate({
  projectName,
  inviterName,
  inviteUrl,
}: InviteEmailTemplateProps) {
  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <div className="bg-white p-6 rounded shadow-lg max-w-2xl mx-auto">
        <div className="border-b pb-4 mb-4">
          <div className="text-xl font-bold text-blue-600">AnyAuth Console</div>
          <div className="text-gray-500 text-sm">Project Invitation</div>
        </div>

        <div className="text-gray-800 leading-relaxed">
          <p className="mb-4">Hello,</p>

          <p className="mb-4">
            <strong>{inviterName}</strong> has invited you to join the project{" "}
            <strong>{projectName}</strong> on AnyAuth Console.
          </p>

          <p className="mb-4">
            Click the button below to view and accept this invitation:
          </p>

          <div className="bg-gray-100 p-4 rounded my-6 text-center">
            <a
              href={inviteUrl}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
              target="_blank"
              rel="noopener noreferrer"
            >
              Accept Invitation
            </a>
          </div>

          <p className="mb-4">
            If the button doesn&apos;t work, you can copy and paste the
            following link into your browser:
          </p>

          <div className="bg-gray-100 p-3 rounded break-all mb-4 text-blue-600">
            {inviteUrl}
          </div>

          <p className="mb-4">
            This invitation will expire in 15 minutes. If you didn&apos;t
            request to join this project, you can ignore this email.
          </p>

          <p className="mb-4">
            Thank you,
            <br />
            The AnyAuth Team
          </p>
        </div>

        <div className="border-t pt-4 mt-4 text-xs text-gray-500">
          <p className="mb-2">
            This email was sent to [recipient&apos;s email]. If you have any
            questions, please contact support@anyauth.com.
          </p>
          <p>
            &copy; {new Date().getFullYear()} AnyAuth Console. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

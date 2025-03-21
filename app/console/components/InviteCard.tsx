"use client";

import { formatDistanceToNow } from "date-fns";
import { Invite } from "@/app/types/invite";

interface InviteCardProps {
  invite: Invite;
  onResend?: () => Promise<void>;
  onCancel?: () => Promise<void>;
  isLoading?: boolean;
}

export default function InviteCard({
  invite,
  onResend,
  onCancel,
  isLoading = false,
}: InviteCardProps) {
  // Check if the invite is expired
  const isExpired = invite.expires_at * 1000 < Date.now();

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Invitation to {invite.email}
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Sent{" "}
                {formatDistanceToNow(new Date(invite.created_at * 1000), {
                  addSuffix: true,
                })}
              </p>
              <p className="mt-1">
                {isExpired ? (
                  <span className="text-red-600">
                    Expired{" "}
                    {formatDistanceToNow(new Date(invite.expires_at * 1000), {
                      addSuffix: true,
                    })}
                  </span>
                ) : (
                  <span>
                    Expires{" "}
                    {formatDistanceToNow(new Date(invite.expires_at * 1000), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            {onResend && (
              <button
                type="button"
                onClick={onResend}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Resend"}
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isLoading ? "Canceling..." : "Cancel Invitation"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

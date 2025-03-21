"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { APIKey } from "@/app/types/api";

interface EditAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (formData: {
    name: string;
    description: string;
    expiresAt: Date | null;
  }) => void;
  apiKey: APIKey;
}

export default function EditAPIKeyModal({
  isOpen,
  onClose,
  onUpdate,
  apiKey,
}: EditAPIKeyModalProps) {
  const [name, setName] = useState(apiKey.name);
  const [description, setDescription] = useState(apiKey.description);
  const [expiresAt, setExpiresAt] = useState<Date | null>(
    apiKey.expires_at ? new Date(apiKey.expires_at * 1000) : null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Update form when apiKey changes
  useEffect(() => {
    if (apiKey) {
      setName(apiKey.name);
      setDescription(apiKey.description);
      setExpiresAt(
        apiKey.expires_at ? new Date(apiKey.expires_at * 1000) : null
      );
    }
  }, [apiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onUpdate({ name, description, expiresAt });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-medium text-gray-900">Edit API Key</h3>
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
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="edit-name"
                className="block text-sm font-medium text-gray-700"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="edit-name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="edit-description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="edit-expires-at"
                className="block text-sm font-medium text-gray-700"
              >
                Expiration Date
              </label>
              <div className="mt-1">
                <DatePicker
                  id="edit-expires-at"
                  selected={expiresAt}
                  onChange={(date) => setExpiresAt(date)}
                  minDate={new Date()}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholderText="Never expires"
                  isClearable
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Leave empty for keys that never expire.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Key ID
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  readOnly
                  value={apiKey.id}
                  className="bg-gray-50 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Created
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  readOnly
                  value={new Date(apiKey.created_at * 1000).toLocaleString()}
                  className="bg-gray-50 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PasskeyModal = ({ isOpen, onClose, codespace, onAccessGranted }) => {
  const [passkey, setPasskey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/codespace/${codespace.slug}/verify-passkey`,
        { passkey },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Access granted successfully');
      onAccessGranted();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify passkey');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6">
          <h3 className="text-xl font-semibold mb-4">Enter Passkey</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              placeholder="Enter 6-character passkey"
              maxLength={6}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || passkey.length !== 6}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default PasskeyModal;
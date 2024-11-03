import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faKey } from '@fortawesome/free-solid-svg-icons';
import useThemeStore from '../store/useThemeStore';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PasskeyVerificationModal = ({ isOpen, onClose, codespace, onSuccess }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const [passkey, setPasskey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/codespace/${codespace.slug}/verify-passkey`,
        { passkey },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.status === 'success') {
        toast.success('Access granted!');
        onSuccess();
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid passkey');
      toast.error('Access denied');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className={`relative w-full max-w-md rounded-xl ${
          isDarkMode ? 'bg-[#1e1e1e] text-white' : 'bg-white'
        } p-6 shadow-xl`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Enter Passkey</h3>
            <button onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Passkey for {codespace.slug}
                </label>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faKey} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value.toUpperCase())}
                    maxLength={6}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-[#2d2d2d] border-gray-700' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>

              <div className="flex justify-end gap-3">
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
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                >
                  {isLoading ? 'Verifying...' : 'Submit'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasskeyVerificationModal; 
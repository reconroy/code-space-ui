import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLock, faGlobe, faUsers } from '@fortawesome/free-solid-svg-icons';
import useThemeStore from '../store/useThemeStore';
import { codespaceService } from '../services/codespace.service';
import { toast } from 'react-hot-toast';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useNavigate } from 'react-router-dom';

const ManageCodespaceModal = ({ isOpen, onClose, codespace }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const [formData, setFormData] = useState({
    newSlug: '',
    accessType: 'private',
    passkey: '',
    isArchived: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const socket = useWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && codespace) {
      setFormData({
        newSlug: codespace.slug,
        accessType: codespace.access_type || 'private',
        passkey: '',
        isArchived: codespace.is_archived || false
      });
    }
  }, [isOpen, codespace]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const settings = {
        newSlug: formData.newSlug !== codespace.slug ? formData.newSlug : undefined,
        accessType: formData.accessType,
        passkey: formData.accessType === 'shared' ? formData.passkey : null,
        isArchived: formData.isArchived
      };

      const response = await codespaceService.updateSettings(codespace.slug, settings);
      if (response.status === 'success') {
        socket.emit('codespaceUpdated', {
          userId: codespace.owner_id,
          codespace: {
            ...codespace,
            id: codespace.id,
            slug: settings.newSlug || codespace.slug,
            access_type: settings.accessType,
            is_archived: settings.isArchived
          }
        });

        // If slug changed, update the URL
        if (settings.newSlug) {
          navigate(`/${settings.newSlug}`, { replace: true });
        }

        toast.success('Changes saved successfully');
        onClose();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDefaultCodespaceContent = () => (
    <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Codespace Name</label>
          <div className={`w-full rounded-lg border p-2.5 ${isDarkMode ? 'bg-[#2d2d2d] border-gray-700' : 'bg-white border-gray-300'}`}>
            {codespace.slug}
          </div>
        </div>
      <div>
        <label className="block text-sm font-medium mb-2">Language</label>
        <div className={`w-full rounded-lg border p-2.5 ${isDarkMode ? 'bg-[#2d2d2d] border-gray-700' : 'bg-white border-gray-300'}`}>
          {codespace.language || 'Plain Text'}
        </div>
      </div>


      <div>
        <label className="block text-sm font-medium mb-2">Type</label>
        <div className={`w-full rounded-lg border p-2.5 ${isDarkMode ? 'bg-[#2d2d2d] border-gray-700' : 'bg-white border-gray-300'}`}>
          Default Codespace
        </div>
      </div>

      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#2d2d2d]' : 'bg-gray-100'}`}>
        <p className="text-sm">
          This is your default codespace. It serves as your primary workspace and cannot be modified or deleted. 
          It's automatically created when you first sign up and remains accessible at all times.
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onClose}
          className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
        >
          Close
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className={`relative w-full max-w-lg rounded-xl ${isDarkMode ? 'bg-[#1e1e1e] text-white' : 'bg-white'} p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              {codespace.is_default ? 'Default Codespace Info' : 'Manage Codespace'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Content */}
          {codespace.is_default ? renderDefaultCodespaceContent() : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Codespace Name</label>
                <input
                  type="text"
                  name="newSlug"
                  value={formData.newSlug}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border p-2.5 ${isDarkMode ? 'bg-[#2d2d2d] border-gray-700' : 'bg-white border-gray-300'}`}
                />
              </div>

              {/* Access Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Access Type</label>
                <div className="space-y-2">
                  {[
                    { id: 'private', icon: faLock, label: 'Private' },
                    { id: 'public', icon: faGlobe, label: 'Public' },
                    { id: 'shared', icon: faUsers, label: 'Shared' }
                  ].map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, accessType: type.id }))}
                      className={`w-full p-3 rounded-lg border flex items-center gap-3 
                        ${formData.accessType === type.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                          : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      <FontAwesomeIcon icon={type.icon} />
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Passkey (only for shared access) */}
              {formData.accessType === 'shared' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Passkey</label>
                  <input
                    type="text"
                    name="passkey"
                    value={formData.passkey}
                    onChange={handleInputChange}
                    maxLength={6}
                    placeholder="Enter 6-digit passkey"
                    className={`w-full rounded-lg border p-2.5 ${isDarkMode ? 'bg-[#2d2d2d] border-gray-700' : 'bg-white border-gray-300'}`}
                  />
                </div>
              )}

              {/* Archive Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="archive"
                  checked={formData.isArchived}
                  onChange={(e) => setFormData(prev => ({ ...prev, isArchived: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="archive">Archive this codespace</label>
              </div>

              {/* Delete Confirmation */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Delete this codespace
                </button>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {!codespace.is_default && (
        <DeleteConfirmationModal 
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          codespace={codespace}
          onModalClose={onClose}
        />
      )}
    </div>,
    document.getElementById('modal-root')
  );
};

export default ManageCodespaceModal;
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLock, faGlobe, faUsers, faKey } from '@fortawesome/free-solid-svg-icons';
import useThemeStore from '../store/useThemeStore';
import { codespaceService } from '../services/codespace.service';
import { toast } from 'react-hot-toast';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useNavigate } from 'react-router-dom';

const ManageCodespaceModal = ({ isOpen, onClose, codespace }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const [isUpdatingPasskey, setIsUpdatingPasskey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    newSlug: '',
    accessType: 'private',
    passkey: '',
    isArchived: false
  });
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const socket = useWebSocket();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && codespace) {
      setFormData({
        newSlug: codespace.slug,
        accessType: codespace.access_type || 'private',
        passkey: '',
        isArchived: codespace.is_archived || false
      });
      setIsUpdatingPasskey(false);
      setErrors({});
    }
  }, [isOpen, codespace]);

  // Validate form whenever formData changes
  useEffect(() => {
    const newErrors = {};
    
    if (!formData.newSlug.trim()) {
      newErrors.newSlug = 'Name is required';
    }
    
    if (formData.accessType === 'shared' && 
        (!codespace.passkey || isUpdatingPasskey) && 
        (!formData.passkey || formData.passkey.length !== 6)) {
      newErrors.passkey = 'Passkey must be exactly 6 characters';
    }
    
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [formData, isUpdatingPasskey, codespace.passkey]);

  // Check if any changes were made
  const hasChanges = () => {
    return formData.newSlug !== codespace.slug || 
           formData.accessType !== codespace.access_type ||
           formData.isArchived !== codespace.is_archived ||
           (isUpdatingPasskey && formData.passkey.length === 6);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'passkey') {
      const alphanumericValue = value.replace(/[^a-zA-Z0-9]/g, '');
      const truncatedValue = alphanumericValue.slice(0, 6);
      setFormData(prev => ({
        ...prev,
        [name]: truncatedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const settings = {
        newSlug: formData.newSlug !== codespace.slug ? formData.newSlug : undefined,
        accessType: formData.accessType,
        isArchived: formData.isArchived,
        passkey: formData.passkey || (formData.accessType !== 'shared' ? null : undefined)
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

  const renderPasskeySection = () => {
    const isNewSharedAccess = formData.accessType === 'shared' && !codespace.passkey;
    const isExistingSharedAccess = formData.accessType === 'shared' && codespace.passkey;

    if (!formData.accessType === 'shared') return null;

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">
            {isNewSharedAccess ? 'Add Passkey' : 'Passkey'}
          </label>
          {isExistingSharedAccess && !isUpdatingPasskey && (
            <button
              type="button"
              onClick={() => setIsUpdatingPasskey(true)}
              className="text-xs text-blue-500 hover:text-blue-600"
            >
              Update passkey
            </button>
          )}
          {isUpdatingPasskey && (
            <button
              type="button"
              onClick={() => {
                setIsUpdatingPasskey(false);
                setFormData(prev => ({ ...prev, passkey: '' }));
                setErrors(prev => ({ ...prev, passkey: undefined }));
              }}
              className="text-xs text-gray-500 hover:text-gray-600"
            >
              Cancel
            </button>
          )}
        </div>

        {(isNewSharedAccess || isUpdatingPasskey) ? (
          <div className="relative">
            <FontAwesomeIcon 
              icon={faKey} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              name="passkey"
              value={formData.passkey}
              onChange={(e) => {
                const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                if (value.length <= 6) {
                  setFormData(prev => ({ ...prev, passkey: value }));
                }
              }}
              placeholder="Enter 6-character passkey"
              maxLength={6}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-[#2d2d2d] border-gray-700' 
                  : 'bg-white border-gray-300'
              } ${errors.passkey ? 'border-red-500' : ''}`}
            />
            {errors.passkey && (
              <p className="mt-1 text-sm text-red-500">{errors.passkey}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Current passkey is set
          </p>
        )}
      </div>
    );
  };

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
              {/* Name input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="newSlug"
                  value={formData.newSlug}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-[#2d2d2d] border-gray-700' : 'bg-white border-gray-300'
                  } ${errors.newSlug ? 'border-red-500' : ''}`}
                />
                {errors.newSlug && (
                  <p className="mt-1 text-sm text-red-500">{errors.newSlug}</p>
                )}
              </div>

              {/* Access Type */}
              <div className="mb-4">
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

              {/* Passkey section */}
              {formData.accessType === 'shared' && renderPasskeySection()}

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

              {/* Form buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg border ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!hasChanges() || !isValid || isLoading}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 
                           disabled:opacity-50 disabled:cursor-not-allowed"
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
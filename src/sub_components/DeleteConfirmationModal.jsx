import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import useThemeStore from '../store/useThemeStore';
import { codespaceService } from '../services/codespace.service';
import { toast } from 'react-hot-toast';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useNavigate, useLocation } from 'react-router-dom';
import useCodespaceStore from '../store/useCodespaceStore';

const DeleteConfirmationModal = ({ isOpen, onClose, codespace, onModalClose }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const [isLoading, setIsLoading] = useState(false);
  const socket = useWebSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultCodespace = useCodespaceStore(state => 
    state.codespaces.find(cs => cs.is_default)
  );

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await codespaceService.deleteCodespace(codespace.slug);
      if (response.status === 'success') {
        socket.emit('codespaceDeleted', {
          userId: codespace.owner_id,
          codespaceId: codespace.id,
          slug: codespace.slug
        });

        // Navigate to default if deleting current codespace
        if (location.pathname === `/${codespace.slug}` && defaultCodespace) {
          navigate(`/${defaultCodespace.slug}`);
        }

        toast.success('Codespace deleted successfully');
        onClose();
        onModalClose();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete codespace');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className={`relative w-full max-w-md rounded-xl ${isDarkMode ? 'bg-[#1e1e1e] text-white' : 'bg-white'} p-6`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-red-500">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" />
              <h3 className="text-xl font-semibold">Delete Codespace</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p>Are you sure you want to delete <span className="font-semibold">{codespace.slug}</span>?</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone. All data associated with this codespace will be permanently deleted.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default DeleteConfirmationModal;

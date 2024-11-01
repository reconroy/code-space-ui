import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, faGlobe, faLock, faUsers,
  faInfoCircle, faClock, faCode,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import {
  faJsSquare, faPython, faCss3Alt,
  faJava, faPhp
} from '@fortawesome/free-brands-svg-icons';
import useThemeStore from '../store/useThemeStore';

const ManageCodespaceModal = ({ isOpen, onClose, codespace }) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const [newSlug, setNewSlug] = useState(codespace?.slug || '');
  const [accessType, setAccessType] = useState(codespace?.access_type || 'private');
  
  if (!isOpen) return null;

  const accessTypes = [
    { id: 'private', icon: faLock, label: 'Private', 
      description: 'Only you can access this codespace' },
    { id: 'public', icon: faGlobe, label: 'Public', 
      description: 'Anyone with the link can access this codespace' },
    { id: 'shared', icon: faUsers, label: 'Shared', 
      description: 'Only specific users can access this codespace' }
  ];

  const languageConfig = {
    javascript: { icon: faJsSquare, color: 'text-yellow-400' },
    python: { icon: faPython, color: 'text-blue-500' },
    css: { icon: faCss3Alt, color: 'text-blue-400' },
    java: { icon: faJava, color: 'text-red-500' },
    php: { icon: faPhp, color: 'text-indigo-500' }
  };

  const DefaultCodespaceContent = () => {
    const currentLanguage = codespace?.language?.toLowerCase() || 'plaintext';
    const config = languageConfig[currentLanguage];

    const renderLanguageInfo = () => (
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#2d2d2d]' : 'bg-gray-50'}`}>
        <div className="flex items-center">
          {config ? (
            <div className={`w-10 h-10 rounded-lg ${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'} 
              flex items-center justify-center mr-3 ${config.color}`}
            >
              <FontAwesomeIcon icon={config.icon} className="w-6 h-6" />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-lg ${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'} 
              flex items-center justify-center mr-3 text-gray-400 text-xs font-medium`}
            >
              {currentLanguage.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium capitalize">
              {currentLanguage === 'plaintext' ? 'Plain Text' : currentLanguage}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Current Language
            </p>
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Info Banner */}
        <div className={`p-4 mt-2 rounded-lg ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
          <div className="flex items-start">
            <FontAwesomeIcon 
              icon={faInfoCircle} 
              className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" 
            />
            <div>
              <h4 className="font-medium text-blue-500">Default Codespace</h4>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This is your default workspace. It cannot be renamed, archived, or deleted. 
              </p>
            </div>
          </div>
        </div>

        {/* Codespace Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-400">
            Codespace Details
          </h4>
          
          <div className="space-y-3">
            {/* Created At */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#2d2d2d]' : 'bg-gray-50'}`}>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Created on
                  </p>
                  <p className="font-medium mt-0.5">
                    {new Date(codespace.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#2d2d2d]' : 'bg-gray-50'}`}>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Last updated
                  </p>
                  <p className="font-medium mt-0.5">
                    {new Date(codespace.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Language Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 px-1">
                Language
              </h4>
              {renderLanguageInfo()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RegularCodespaceContent = () => {
    const currentLanguage = codespace?.language?.toLowerCase() || 'plaintext';
    const config = languageConfig[currentLanguage];

    const renderLanguageInfo = () => (
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-[#2d2d2d]' : 'bg-gray-50'}`}>
        <div className="flex items-center">
          {config ? (
            <div className={`w-10 h-10 rounded-lg ${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'} 
              flex items-center justify-center mr-3 ${config.color}`}
            >
              <FontAwesomeIcon icon={config.icon} className="w-6 h-6" />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-lg ${isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white'} 
              flex items-center justify-center mr-3 text-gray-400 text-xs font-medium`}
            >
              {currentLanguage.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium capitalize">
              {currentLanguage === 'plaintext' ? 'Plain Text' : currentLanguage}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Current Language
            </p>
          </div>
        </div>
      </div>
    );

    return (
      <div className="mt-6 space-y-6">
        {/* Language Info - Added at the top */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">
            Language
          </h4>
          {renderLanguageInfo()}
        </div>

        {/* Rename Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Rename Codespace
          </label>
          <div className="mt-1">
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className={`block w-full rounded-lg border px-4 py-2.5
                ${isDarkMode 
                  ? 'bg-[#2d2d2d] border-gray-700 focus:border-blue-500' 
                  : 'bg-white border-gray-300 focus:border-blue-500'}
                focus:outline-none focus:ring-1 focus:ring-blue-500
                transition-colors`}
              placeholder="Enter new name"
            />
          </div>
        </div>

        {/* Access Type Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Access Type
          </label>
          <div className="space-y-2">
            {accessTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => setAccessType(type.id)}
                className={`flex items-center p-4 rounded-lg cursor-pointer
                  ${accessType === type.id 
                    ? isDarkMode 
                      ? 'bg-blue-500/10 border-2 border-blue-500' 
                      : 'bg-blue-50 border-2 border-blue-500'
                    : `border-2 border-transparent 
                       ${isDarkMode ? 'hover:bg-[#2d2d2d]' : 'hover:bg-gray-50'}`}
                  transition-all duration-200`}
              >
                <FontAwesomeIcon icon={type.icon} className={`w-5 h-5 mr-3 
                  ${accessType === type.id ? 'text-blue-500' : 'text-gray-400'}`} 
                />
                <div className="flex-1">
                  <p className="font-medium">{type.label}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {type.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-3 pt-4 border-t dark:border-gray-700">
          <h4 className="text-sm font-medium text-red-500">
            Danger Zone
          </h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className={`flex-1 px-4 py-2.5 rounded-lg border-2 
                ${isDarkMode 
                  ? 'border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10' 
                  : 'border-yellow-500/30 text-yellow-600 hover:bg-yellow-50'}
                transition-colors`}
            >
              Archive Codespace
            </button>
            <button
              className={`flex-1 px-4 py-2.5 rounded-lg border-2 
                ${isDarkMode 
                  ? 'border-red-500/20 text-red-500 hover:bg-red-500/10' 
                  : 'border-red-500/30 text-red-600 hover:bg-red-50'}
                transition-colors`}
            >
              Delete Codespace
            </button>
          </div>
        </div>
      </div>
    );
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className={`relative transform overflow-hidden rounded-xl 
              ${isDarkMode ? 'bg-[#1e1e1e] text-white' : 'bg-white text-gray-900'}
              px-6 pb-6 pt-5 text-left shadow-xl transition-all w-full max-w-lg
              mx-auto border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            onClick={e => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold">
                {codespace.is_default 
                  ? 'Default Codespace Details' 
                  : `Manage Codespace "${codespace?.slug}"`}
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 
                         transition-colors text-gray-500 dark:text-gray-400"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {codespace.is_default ? <DefaultCodespaceContent /> : <RegularCodespaceContent />}

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className={`px-4 py-2.5 rounded-lg border 
                  ${isDarkMode 
                    ? 'border-gray-700 hover:bg-gray-800' 
                    : 'border-gray-300 hover:bg-gray-50'}
                  transition-colors`}
              >
                {codespace.is_default ? 'Close' : 'Cancel'}
              </button>
              {!codespace.is_default && (
                <button
                  className="px-4 py-2.5 rounded-lg bg-blue-500 text-white 
                    hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.getElementById('modal-root'));
};

export default ManageCodespaceModal;
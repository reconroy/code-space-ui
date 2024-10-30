import React, { useState } from 'react';
import { FaDownload, FaTextHeight, FaRandom, FaCopy, FaMap, FaPlay, FaExchangeAlt, FaSignOutAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useThemeStore from '../store/useThemeStore';
import useFontSizeStore from '../store/useFontSizeStore';
import FontSizeSlider from '../sub_components/FontSizeSlider';
import LogoutModal from '../sub_components/LogoutModal';

const languageExtensions = {
  javascript: 'js',
  python: 'py',
  css: 'css',
  java: 'java',
  cpp: 'cpp',
  xml: 'html',
  json: 'json',
  markdown: 'md',
  c: 'c',
  csharp: 'cs',
  html: 'html',
  plaintext: 'txt',
  typescript: 'ts',
  ruby: 'rb',
  go: 'go',
  rust: 'rs',
  swift: 'swift',
  kotlin: 'kt',
  scala: 'scala',
  php: 'php',
  sql: 'sql'
};

const MenuPanel = ({ code, language, onToggleMinimap }) => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const { showFontSizeSlider, toggleFontSizeSlider } = useFontSizeStore();
  const [copySuccess, setCopySuccess] = useState(false);
  const [minimapEnabled, setMinimapEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleToggleMinimap = () => {
    setMinimapEnabled(!minimapEnabled);
    onToggleMinimap(!minimapEnabled);
  };

  const handleDownload = () => {
    const fileExtension = languageExtensions[language] || 'txt';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `code-space-${timestamp}.${fileExtension}`;

    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = async () => {
    if (!navigator.clipboard) {
      // Clipboard API not available
      console.error('Clipboard API not available');
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const handleNewRandomCodespace = () => {
    const randomSlug = Math.random().toString(36).substring(2, 8);
    const newTabUrl = `${window.location.origin}/${randomSlug}`;
    window.open(newTabUrl, '_blank');
  };

  const handleRunCode = () => {
    // Placeholder function for running code
    console.log('Run code functionality to be implemented');
  };

  return (
    <>
      <div className={`w-16 md:w-20 h-full py-2 px-1 md:px-2 shadow-lg flex  flex-col items-center
      ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>
        <div className="flex-grow flex flex-col items-center z-50">
          <button
            onClick={handleRunCode}
            className={`p-3 mb-4 rounded-full md:rounded hover:bg-opacity-75 transition-all transform hover:scale-110 
          ${isDarkMode ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-green-400 to-green-500'} 
          text-white shadow-lg hover:shadow-xl active:scale-95`}
            aria-label="Run Code"
            title="Run Code"
          >
            <div className="relative">
              <FaPlay className="text-xl md:text-2xl" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </button>
          <button
            onClick={handleDownload}
            className={`p-3 mb-4 rounded-full md:rounded hover:bg-opacity-75 transition-transform transform hover:scale-110 
          ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
            aria-label="Download Code"
            title="Download Code"
          >
            <FaDownload className="text-xl md:text-2xl" />
          </button>
          <button
            onClick={copyToClipboard}
            className={`p-3 mb-4 rounded-full md:rounded hover:bg-opacity-75 transition-transform transform hover:scale-110 
          ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}
          ${copySuccess ? 'bg-green-500' : ''}`}
            aria-label="Copy to Clipboard"
            title={copySuccess ? "Copied!" : "Copy to Clipboard"}
          >
            <FaCopy className="text-xl md:text-2xl" />
          </button>
          <div className="relative mb-4">
            <button
              onClick={toggleFontSizeSlider}
              className={`p-3 rounded-full md:rounded hover:bg-opacity-75 transition-transform transform hover:scale-110 
            ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
              aria-label="Adjust Font Size"
              title="Adjust Font Size"
            >
              <FaTextHeight className="text-xl md:text-2xl" />
            </button>
            {showFontSizeSlider && (
              <div className="absolute right-full top-0 mr-2">
                <FontSizeSlider />
              </div>
            )}
          </div>
          <button
            onClick={handleToggleMinimap}
            className={`p-3 mb-4 rounded-full md:rounded hover:bg-opacity-75 transition-transform transform hover:scale-110 
          ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}
          ${minimapEnabled ? 'bg-blue-500' : ''}`}
            aria-label="Toggle Minimap"
            title={minimapEnabled ? "Disable Minimap" : "Enable Minimap"}
          >
            <FaMap className="text-xl md:text-2xl" />
          </button>
          <button
            onClick={handleNewRandomCodespace}
            className={`p-3 mb-4 rounded-full md:rounded hover:bg-opacity-75 transition-transform transform hover:scale-110 
          ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
            aria-label="New Random Codespace"
            title="New Random Codespace"
          >
            <FaRandom className="text-xl md:text-2xl" />
          </button>
          <Link
            to="/diff-checker"
            className={`p-3 rounded-full md:rounded hover:bg-opacity-75 transition-transform transform hover:scale-110 
          ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
            aria-label="Diff Checker"
            title="Go to Diff Checker"
          >
            <FaExchangeAlt className="text-xl md:text-2xl" />
          </Link>
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          className={`mt-auto p-3 rounded-full md:rounded hover:bg-opacity-75 transition-transform transform hover:scale-110 
            ${isDarkMode ? 'bg-gray-700 text-white hover:bg-red-600' : 'bg-gray-300 text-black hover:bg-red-500 hover:text-white'}`}
          aria-label="Logout"
          title="Logout"
        >
          <FaSignOutAlt className="text-xl md:text-2xl" />
        </button>
      </div>
      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default MenuPanel;
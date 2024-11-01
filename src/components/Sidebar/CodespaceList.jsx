import React from 'react';
import { FaPlus } from 'react-icons/fa';
import CodespaceCard from './CodespaceCard';
import useCodespaceStore from '../../store/useCodespaceStore';
import { useNavigate } from 'react-router-dom';

const CodespaceList = () => {
  const { codespaces, createNewCodespace, loading } = useCodespaceStore();
  const navigate = useNavigate();

  const handleCreateCodespace = async () => {
    const newSlug = await createNewCodespace();
    if (newSlug) {
      navigate(`/${newSlug}`);
    }
  };

  // Separate default codespace from others
  const defaultCodespace = codespaces.find(cs => cs.is_default);
  const otherCodespaces = codespaces.filter(cs => !cs.is_default);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Default Codespace */}
      {defaultCodespace && (
        <CodespaceCard 
          codespace={defaultCodespace} 
          isDefault={true}
        />
      )}

      {/* New Codespace Button */}
      <button
        onClick={handleCreateCodespace}
        className="w-full flex items-center justify-center p-2 mt-4 mb-2 
                 rounded-lg border-2 border-dashed 
                 border-gray-400 dark:border-gray-600
                 hover:border-blue-500 dark:hover:border-blue-400
                 transition-colors duration-200"
      >
        <FaPlus className="mr-2" />
        <span>New Codespace</span>
      </button>

      {/* Other Codespaces */}
      <div className="mt-4">
        {otherCodespaces.map(codespace => (
          <CodespaceCard 
            key={codespace.id} 
            codespace={codespace}
            isDefault={false}
          />
        ))}
      </div>
    </div>
  );
};

export default CodespaceList;

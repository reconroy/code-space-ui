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

  const defaultCodespace = codespaces.find(cs => cs.is_default);
  const otherCodespaces = codespaces.filter(cs => !cs.is_default);

  return (
    <div className="flex flex-col p-4 space-y-6">
      {/* Default Workspace Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-400 uppercase px-2">
          DEFAULT CODESPACE
        </h3>
        {defaultCodespace && (
          <CodespaceCard 
            codespace={defaultCodespace} 
            isDefault={true}
          />
        )}
      </div>

      {/* New Codespace Button */}
      <button
        onClick={handleCreateCodespace}
        className="flex items-center justify-center p-3 
                 rounded-lg border-2 border-dashed 
                 border-gray-600 hover:border-gray-400
                 transition-colors duration-200 group
                 text-gray-400 hover:text-gray-300"
      >
        <FaPlus className="mr-2 w-4 h-4" />
        <span>New Codespace</span>
      </button>

      {/* Other Workspaces Section */}
      {otherCodespaces.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-400 uppercase px-2">
            YOUR WORKSPACES
          </h3>
          <div className="space-y-2">
            {otherCodespaces.map(codespace => (
              <CodespaceCard 
                key={codespace.id} 
                codespace={codespace}
                isDefault={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodespaceList;

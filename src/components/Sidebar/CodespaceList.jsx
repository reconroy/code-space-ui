import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import CodespaceCard from './CodespaceCard';
import useCodespaceStore from '../../store/useCodespaceStore';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../contexts/WebSocketContext';

const CodespaceList = () => {
  const { 
    codespaces, 
    createNewCodespace, 
    loading,
    updateCodespace,
    deleteCodespace,
    fetchUserCodespaces
  } = useCodespaceStore();
  const navigate = useNavigate();
  const socket = useWebSocket();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Listen for codespace updates
    socket.on('codespaceSettingsChanged', async (updatedCodespace) => {
      console.log('Received settings update:', updatedCodespace);
      // First update the store
      updateCodespace(updatedCodespace);
      // Then refresh the component
      setRefreshKey(prev => prev + 1);
      // Optionally refetch the full list
      await fetchUserCodespaces();
    });

    // Listen for codespace deletions
    socket.on('codespaceDeleted', (codespaceId) => {
      deleteCodespace(codespaceId);
    });

    return () => {
      socket.off('codespaceSettingsChanged');
      socket.off('codespaceDeleted');
    };
  }, [socket, updateCodespace, deleteCodespace, fetchUserCodespaces]);

  const handleCreateCodespace = async () => {
    const newSlug = await createNewCodespace();
    if (newSlug) {
      navigate(`/${newSlug}`);
    }
  };

  // Filter out archived codespaces
  const activeCodespaces = codespaces.filter(cs => !cs.is_archived);
  const defaultCodespace = activeCodespaces.find(cs => cs.is_default);
  const otherCodespaces = activeCodespaces.filter(cs => !cs.is_default);

  return (
    <div className="flex flex-col p-4 space-y-6" key={refreshKey}>
      {/* Default Workspace Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-400 uppercase px-2">
          DEFAULT CODESPACE
        </h3>
        {defaultCodespace && (
          <CodespaceCard 
            key={`${defaultCodespace.id}-${defaultCodespace.access_type}-${refreshKey}`}
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
                key={`${codespace.id}-${codespace.access_type}-${refreshKey}`}
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';

const AccessLogsSection = ({ codespace }) => {
  const [accessLogs, setAccessLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccessLogs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/codespace/${codespace.slug}/access-logs`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.status === 'success') {
          setAccessLogs(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching access logs:', error);
        setError('Failed to load access logs');
      } finally {
        setIsLoading(false);
      }
    };

    if (codespace.access_type === 'shared') {
      fetchAccessLogs();
    }
  }, [codespace]);

  if (codespace.access_type !== 'shared') return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <FontAwesomeIcon icon={faUsers} />
        Access Logs
      </h3>

      {isLoading ? (
        <div className="text-center py-4">
          <FontAwesomeIcon icon={faSpinner} spin />
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : accessLogs.length === 0 ? (
        <p className="text-sm text-gray-500">No one has accessed this codespace yet</p>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {accessLogs.map((log, index) => (
            <div 
              key={index}
              className="text-sm flex justify-between items-center p-2 rounded-lg
                       bg-gray-50 dark:bg-gray-800"
            >
              <span>{log.username}</span>
              <span className="text-gray-500">
                {formatDistanceToNow(new Date(log.access_granted_at), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccessLogsSection;

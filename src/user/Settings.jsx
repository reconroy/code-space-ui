import React from 'react';
import useThemeStore from '../store/useThemeStore';

const Settings = () => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);

  return (
    <div className={`w-full h-full overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="space-y-6">
          <section className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            {/* Add profile settings content */}
          </section>

          <section className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            {/* Add account settings content */}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
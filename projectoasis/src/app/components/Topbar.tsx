'use client';

import { FaStar, FaTh, FaBell, FaRegBell, FaSun, FaMoon, FaSearch, FaFileExport } from 'react-icons/fa';
import { useState } from 'react';

interface TopbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  isRightSidebarCollapsed: boolean;
  toggleRightSidebar: () => void;
  activeModule: string;
}

export default function Topbar({
  darkMode,
  toggleDarkMode,
  isRightSidebarCollapsed,
  toggleRightSidebar,
  activeModule,
}: TopbarProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [notificationsCount, _setNotificationsCount] = useState(0);

  // Handle click on the notification bell
  const handleBellClick = () => {
    if (isRightSidebarCollapsed) {
      toggleRightSidebar(); // Open right sidebar if it's collapsed
    }
    // Add your logic for clearing notifications, if needed
  };

  // Function to handle exporting data in various formats
  const handleExport = (format: string) => {
    console.log(`Exporting data as ${format}`);
    // Add your export logic here for CSV, JSON, PDF, etc.
  };

  return (
    <header className="bg-[#1c1c1c] text-white p-4 w-full flex items-center justify-between shadow-md border-b border-gray-600">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <FaTh className="text-xl" />
        <FaStar className="text-xl" />
        <span className="text-sm">Dashboards</span>
        <span className="text-sm">/</span>
        <span className="text-sm font-bold">{activeModule}</span>
      </div>

      {/* Center section */}
      <div className="flex-grow"></div> {/* Placeholder for flexible center section */}

      {/* Right section */}
      <div className="relative flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-[#2c2c2c] text-white pl-10 pr-4 py-1 rounded-lg text-sm focus:outline-none"
          />
        </div>

        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkMode}>
          {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
        </button>

        {/* Notification Bell with Counter */}
        <div className="relative" onClick={handleBellClick}>
          {notificationsCount > 0 ? (
              <FaBell className="text-xl cursor-pointer" />
          ) : (
              <FaRegBell className="text-xl cursor-pointer" />
          )}

          {notificationsCount > 0 && (
              <span className="absolute bottom-3 left-3 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {notificationsCount}
              </span>
          )}
        </div>

        {/* Export Button with Dropdown */}
        <div className="relative">
          <button onClick={() => setShowExportOptions(!showExportOptions)} className="text-white">
            <FaFileExport className="text-xl" />
          </button>
          {showExportOptions && (
            <div className="absolute right-0 mt-2 w-40 bg-[#222222] text-white rounded shadow-lg z-50">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-accent"
                onClick={() => handleExport('CSV')}
              >
                Export as CSV
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-accent"
                onClick={() => handleExport('JSON')}
              >
                Export as JSON
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-accent"
                onClick={() => handleExport('PDF')}
              >
                Export as PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

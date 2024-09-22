'use client';

import { FaStar, FaTh, FaBell, FaSun, FaMoon, FaSearch } from 'react-icons/fa';
import { useState } from 'react';

export default function Topbar() {
  const [darkMode, setDarkMode] = useState(true);

  // Toggle between light and dark modes
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="bg-[#1c1c1c] text-white p-4 w-full flex items-center justify-between shadow-md border-b border-gray-600">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <FaTh className="text-xl" />
        <FaStar className="text-xl" />
        <span className="text-sm">Dashboards</span>
        <span className="text-sm">/</span>
        <span className="text-sm font-bold">Default</span>
      </div>

      {/* Center section */}
      <div className="flex-grow"></div> {/* Placeholder for flexible center section */}

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-[#2c2c2c] text-white pl-10 pr-4 py-1 rounded-lg text-sm focus:outline-none"
          />
        </div>

        {/* Icons */}
        <button onClick={toggleDarkMode}>
          {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
        </button>
        <FaBell className="text-xl" />
        <FaTh className="text-xl" />
      </div>
    </header>
  );
}
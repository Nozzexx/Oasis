'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FaFolder, FaBook, FaSun, FaSatellite, FaTrash, FaChartLine, FaGlobe, FaArrowRight, FaArrowLeft, FaRocket, FaMeteor } from 'react-icons/fa';

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
  setActiveModule: (module: string) => void;
}

export default function LeftSidebar({ collapsed, toggleCollapse, setActiveModule }: SidebarProps) {

  const appVersion = process.env.NEXT_PUBLIC_OASIS_APP_VERSION || ' Unknown';

  const [activeCategory, setActiveCategory] = useState<string>('Overview');
  const [activeTab, setActiveTab] = useState<string>('favorites');
  const [favorites, setFavorites] = useState<string[]>(['Overview', 'Projects']);
  const [recentlyVisited, setRecentlyVisited] = useState<string[]>(['Data Display', 'Space Weather', 'Risk Assessment']);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);  // Track hovered item for tooltips

  const categories = [
    { name: 'Overview', icon: <FaGlobe />, module: 'DashboardModule' },
    { name: 'Orbital Regions', icon: <FaRocket />, module: 'OrbitalRegionsModule' },
    { name: 'Data Display', icon: <FaBook />, module: 'DataDisplayModule' },
    { name: 'Space Weather', icon: <FaSun />, module: 'SpaceWeatherModule' },
    { name: 'Debris Tracking', icon: <FaTrash />, module: 'DebrisTrackingModule' },
    { name: 'Risk Assessment', icon: <FaChartLine />, module: 'RiskAssessmentModule' },
    { name: 'Satellite Status', icon: <FaSatellite />, module: 'SatelliteStatusModule' },
    { name: 'Near Earth Objs', icon: <FaMeteor />, module: 'NearEarthObjectsModule' },
  ];

  return (
    <div className={`h-screen bg-[#1c1c1c] p-4 transition-all duration-300 flex flex-col justify-between ${collapsed ? 'w-24' : 'w-72'} border-r border-gray-600`}>
      {/* Top section */}
      <div>
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            {/* Logo Image (always visible) */}
            <Image src="/assets/images/OASIS_LOGO.png" alt="OASIS Logo" width={collapsed ? 40 : 40} height={collapsed ? 40 : 40} />
            {!collapsed && (
              <h1 className="text-3xl font-bold text-white ml-2">O.A.S.I.S.</h1>
            )}
          </div>

          {/* Collapse Button */}
          <button onClick={toggleCollapse} className="text-white">
            {collapsed ? <FaArrowRight /> : <FaArrowLeft />}
          </button>
        </div>

        {/* Tabs for Favorites and Recently */}
        {!collapsed && (
          <div className="mb-8">
            <div className="flex space-x-4">
              <button
                className={`text-white ${
                  activeTab === 'favorites'
                    ? 'border-b-2 border-accent text-white'
                    : 'text-gray-400'
                }`}
                onClick={() => setActiveTab('favorites')}
              >
                Favorites
              </button>
              <button
                className={`text-white ${
                  activeTab === 'recently'
                    ? 'border-b-2 border-accent text-white'
                    : 'text-gray-400'
                }`}
                onClick={() => setActiveTab('recently')}
              >
                Recently
              </button>
            </div>

            {/* Scrollable Content Based on Active Tab */}
            <div className="h-24 overflow-y-auto mt-2">
              {activeTab === 'favorites' ? (
                <ul className="space-y-2">
                  {favorites.map((item) => (
                    <li key={item} className="text-white">{item}</li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2">
                  {recentlyVisited.map((item) => (
                    <li key={item} className="text-white">{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Title for Categories */}
        {!collapsed && <h2 className="text-white text-lg font-semibold mb-4">Categories</h2>}

        {/* Categories */}
        <div className="mt-2">
          <ul className="space-y-2">
            {categories.map((category) => (
              <li
                key={category.name}
                onMouseEnter={() => setHoveredItem(category.name)}  // Show tooltip on hover
                onMouseLeave={() => setHoveredItem(null)}  // Hide tooltip on mouse leave
                className="relative"  // Make sure tooltip is positioned relative to the item
              >
                <button
                  onClick={() => {
                    setActiveCategory(category.name);
                    setActiveModule(category.module);
                  }}
                  className={`flex items-center space-x-2 w-full p-2 rounded transition-all duration-300 ${
                    activeCategory === category.name
                      ? 'bg-accent text-white'
                      : 'text-white hover:border hover:border-accent'
                  } ${collapsed ? 'justify-center' : 'justify-start'}`}
                  style={{ height: '48px' }}
                >
                  <span className="flex-shrink-0 text-center">{category.icon}</span>
                  {!collapsed && <span>{category.name}</span>}
                </button>

                {/* Tooltip */}
                {collapsed && hoveredItem === category.name && (
                   <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded px-3 py-1 shadow-lg opacity-100 z-50">
                    {category.name}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Version Text (Centered at the Bottom) */}
      {!collapsed && (
        <div className="text-white text-center mb-4">
          Version {appVersion}
        </div>
      )}
    </div>
  );
}

'use client';

import { ReactNode, useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import Topbar from './Topbar';
import DashboardModule from './DashboardModule';
import DataDisplayModule from './DataDisplayModule';
import NearEarthObjectsModule from './NearEarthObjectsModule';
import OrbitalRegionsModule from './OrbitalRegionsModule';
import SpaceWeatherModule from './SpaceWeatherModule';
import RiskAssessmentModule from './RiskAssessmentModule';
import SatelliteStatusModule from './SatelliteStatusModule';
import DebrisTrackingModule from './DebrisTrackingModule';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isLeftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3); // Initial notification count

  // Handle active module
  const [activeModule, setActiveModule] = useState('DashboardModule'); // Default module

  // Handle dark mode toggle
  const [darkMode, setDarkMode] = useState(true);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Function to reduce the notification count
  const handleNotificationClick = () => {
    setNotificationsCount((prevCount) => Math.max(prevCount - 1, 0));
  };

  // Function to render the active module dynamically
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'DashboardModule':
        return <DashboardModule />;
      case 'DataDisplayModule':
        return <DataDisplayModule />;
      case 'NearEarthObjectsModule':
        return <NearEarthObjectsModule />;
      case 'OrbitalRegionsModule':
        return <OrbitalRegionsModule />;
      case 'SpaceWeatherModule':
        return <SpaceWeatherModule />;
      case 'DebrisTrackingModule':
        return <DebrisTrackingModule />;
      case 'RiskAssessmentModule':
        return <RiskAssessmentModule />;
      case 'SatelliteStatusModule':
        return <SatelliteStatusModule />;
      default:
        return <DashboardModule />; // Fallback to default
    }
  };

  return (
    <div className={`h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* Left Sidebar */}
      <LeftSidebar
        collapsed={isLeftSidebarCollapsed}
        toggleCollapse={() => setLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        setActiveModule={setActiveModule} // Pass setActiveModule to LeftSidebar for module switching
      />

      {/* Main Content Area (Topbar + Central Content) */}
      <div className="flex flex-col flex-1">
        {/* Topbar */}
        <Topbar
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
          isRightSidebarCollapsed={isRightSidebarCollapsed}
          toggleRightSidebar={() => setRightSidebarCollapsed(!isRightSidebarCollapsed)}
        />

        {/* Central Content Area */}
        <main
          className="flex-1 overflow-y-auto bg-[#1c1c1c] relative"
          style={{
            opacity: 0.8,
            backgroundImage: `
              linear-gradient(#222222 2px, transparent 2px),
              linear-gradient(90deg, #222222 2px, transparent 2px),
              linear-gradient(#222222 1px, transparent 1px),
              linear-gradient(90deg, #222222 1px, #1c1c1c 1px)
            `,
            backgroundSize: '50px 50px, 50px 50px, 10px 10px, 10px 10px',
            backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px',
          }}
        >
          {renderActiveModule()} {/* Render the active module dynamically */}
        </main>
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        collapsed={isRightSidebarCollapsed}
        toggleCollapse={() => setRightSidebarCollapsed(!isRightSidebarCollapsed)}
        handleNotificationClick={handleNotificationClick} // Pass handleNotificationClick to RightSidebar
      />
    </div>
  );
}

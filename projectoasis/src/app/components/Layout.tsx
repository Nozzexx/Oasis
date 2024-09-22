'use client';

import { ReactNode, useState } from 'react';
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
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isLeftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  
  const [activeModule, setActiveModule] = useState('DashboardModule'); // Default module

  // Function to render the active module
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'DashboardModule':
        return <DashboardModule />;
      case 'DataDisplayModule':
        return <DataDisplayModule />;
      case 'NearEarthObjectsModule':
        return <NearEarthObjectsModule />;
      case 'OrbitalRegionsModule':
        return <OrbitalRegionsModule />; // Render OrbitalRegionsModule
      case 'SpaceWeatherModule':
        return <SpaceWeatherModule />;   // Render SpaceWeatherModule
      case 'DebrisTrackingModule':
        return <DebrisTrackingModule/>;  // Render DebrisTrackingModule
      case 'RiskAssessmentModule':
        return <RiskAssessmentModule />; // Render RiskAssessmentModule
      case 'SatelliteStatusModule':
        return <SatelliteStatusModule />; // Render SatelliteStatusModule
      default:
        return <DashboardModule />; // Default to Dashboard
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Sidebar */}
      <LeftSidebar 
        collapsed={isLeftSidebarCollapsed} 
        toggleCollapse={() => setLeftSidebarCollapsed(!isLeftSidebarCollapsed)} 
        setActiveModule={setActiveModule}  // Pass setActiveModule to LeftSidebar
      />

      {/* Main Content Area (Topbar + Central Content) */}
      <div className="flex flex-col flex-1">
        {/* Topbar */}
        <Topbar />

        {/* Central Content Area */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            backgroundColor: '#1c1c1c',
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
          {renderActiveModule()} {/* Dynamically render the active module */}
        </main>
      </div>

      {/* Right Sidebar */}
      <RightSidebar 
        collapsed={isRightSidebarCollapsed} 
        toggleCollapse={() => setRightSidebarCollapsed(!isRightSidebarCollapsed)} 
      />
    </div>
  );
}

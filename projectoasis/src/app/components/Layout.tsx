'use client';

import { ReactNode, useState } from 'react';
import LeftSidebar from '@/app/components/LeftSidebar';
import RightSidebar from '@/app/components/RightSidebar';
import Topbar from '@/app/components/Topbar';

import DashboardModule from '@/app/components/DashboardModule';
import DataDisplayModule from '@/app/components/DataDisplayModule';
import NearEarthObjectsModule from '@/app/components/NearEarthObjectsModule';
import OrbitalRegionsModule from '@/app/components/OrbitalRegionsModule';
import SpaceWeatherModule from '@/app/components/SpaceWeatherModule';
import RiskAssessmentModule from '@/app/components/RiskAssessmentModule';
import SatelliteStatusModule from '@/app/components/SatelliteStatusModule';
import DebrisTrackingModule from '@/app/components/DebrisTrackingModule';
import ExoplanetModule from '@/app/components/ExoplanetModule';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isLeftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('DashboardModule'); // Default to DashboardModule
  const [activeCategory, setActiveCategory] = useState('Dashboard');

  // Dynamically render the active module
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
      case 'RiskAssessmentModule':
        return <RiskAssessmentModule />;
      case 'SatelliteStatusModule':
        return <SatelliteStatusModule />;
      case 'DebrisTrackingModule':
        return <DebrisTrackingModule />;
      case 'ExoplanetModule':
        return <ExoplanetModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="h-screen flex">
      <LeftSidebar
        collapsed={isLeftSidebarCollapsed}
        toggleCollapse={() => setLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
        setActiveModule={setActiveModule}
        setActiveCategory={setActiveCategory}
      />
      <div className="flex flex-col flex-1">
        <Topbar
          isRightSidebarCollapsed={isRightSidebarCollapsed}
          toggleRightSidebar={() => setRightSidebarCollapsed(!isRightSidebarCollapsed)}
          activeModule={activeCategory}
        />
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
          {renderActiveModule()}
        </main>
      </div>
      <RightSidebar
        collapsed={isRightSidebarCollapsed}
        toggleCollapse={() => setRightSidebarCollapsed(!isRightSidebarCollapsed)}
        handleNotificationClick={() => {}}
      />
    </div>
  );
}

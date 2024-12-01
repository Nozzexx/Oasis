'use client';

import { ReactNode, useState } from 'react';
import LeftSidebar from '@/app/components/LeftSidebar';
import RightSidebar from '@/app/components/RightSidebar';
import Topbar from '@/app/components/Topbar';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isLeftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [notificationsCount, _setNotificationsCount] = useState(0);
  const [activeModule, setActiveModule] = useState('DashboardModule');
  const [activeCategory, setActiveCategory] = useState('Dashboard');

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
          {children}
        </main>
      </div>
      <RightSidebar
        collapsed={isRightSidebarCollapsed}
        toggleCollapse={() => setRightSidebarCollapsed(!isRightSidebarCollapsed)}
        handleNotificationClick={() => _setNotificationsCount(prev => Math.max(prev - 1, 0))}
      />
    </div>
  );
}
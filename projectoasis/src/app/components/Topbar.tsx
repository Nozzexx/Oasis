'use client';

import { FaTh, FaBell, FaRegBell, FaStar } from 'react-icons/fa';
import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  notification_type: string;
}

interface TopbarProps {
  isRightSidebarCollapsed: boolean;
  toggleRightSidebar: () => void;
  activeModule: string;
}

export default function Topbar({
  isRightSidebarCollapsed,
  toggleRightSidebar,
  activeModule,
}: TopbarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsCount, setNotificationsCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications?read=false');
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();
        setNotifications(data);
        setNotificationsCount(data.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle click on the notification bell
  const handleBellClick = () => {
    if (isRightSidebarCollapsed) {
      toggleRightSidebar();
    }
    
    // Mark all notifications as read
    if (notificationsCount > 0) {
      notifications.forEach(async (notification) => {
        if (!notification.read) {
          try {
            await fetch('/api/notifications', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id: notification.id }),
            });
          } catch (error) {
            console.error('Error marking notification as read:', error);
          }
        }
      });
      setNotificationsCount(0);
    }
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
      <div className="flex-grow"></div>

      {/* Right section */}
      <div className="relative flex items-center space-x-4">
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
      </div>
    </header>
  );
}
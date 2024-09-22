'use client';

import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaArrowLeft, FaArrowRight, FaBell, FaCloudDownloadAlt, FaExclamationCircle, FaBook, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface SidebarItem {
  icon: JSX.Element;
  title: string;
  time: string;
  details: string;
}

interface RightSidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const notifications = [
  { icon: <FaBell />, title: 'You fixed a bug.', time: 'Just now', details: 'Detailed information about the bug fix.' },
  { icon: <FaExclamationCircle />, title: 'Dataset Updated.', time: '59 minutes ago', details: 'Details about the dataset update.' },
  { icon: <FaCloudDownloadAlt />, title: 'A New Update is Available!', time: '12 hours ago', details: 'Details about the latest update.' }
];

const newsUpdates = [
  { icon: <Image src="/assets/images/OASIS_LOGO.png" width={20} height={20} alt="OASIS logo" />, title: 'NASA Heads to the Moon...', time: 'Just now', details: 'NASA is planning a new mission to the moon...' },
  { icon: <Image src="/assets/images/OASIS_LOGO.png" width={20} height={20} alt="OASIS logo" />, title: 'NOAA names Tropical Stor...', time: '59 minutes ago', details: 'NOAA has named the latest tropical storm.' }
];

const education = [
  { icon: <FaBook />, title: 'Getting Started with OASIS...', time: 'Just now', details: 'Learn how to get started with OASIS...' },
  { icon: <FaBook />, title: 'Understanding NEOs...', time: '59 minutes ago', details: 'Understanding Near Earth Objects (NEOs)...' }
];

export default function RightSidebar({ collapsed, toggleCollapse }: RightSidebarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(true);
  const [isNewsUpdatesOpen, setIsNewsUpdatesOpen] = useState(true);
  const [isEducationOpen, setIsEducationOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SidebarItem | null>(null); // Track the clicked item for the modal

  const toggleSection = (section: string) => {
    switch (section) {
      case 'notifications':
        setIsNotificationsOpen(!isNotificationsOpen);
        break;
      case 'news':
        setIsNewsUpdatesOpen(!isNewsUpdatesOpen);
        break;
      case 'education':
        setIsEducationOpen(!isEducationOpen);
        break;
      default:
        break;
    }
  };

  const handleItemClick = (item: SidebarItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className={`h-screen bg-[#1c1c1c] p-4 transition-all duration-300 flex flex-col justify-start ${collapsed ? 'w-24' : 'w-72'} border-l border-gray-600`}>
      {/* Sidebar collapse/expand toggle */}
      <div className="cursor-pointer text-white mb-4" onClick={toggleCollapse}>
        {collapsed ? <FaArrowLeft /> : <FaArrowRight />}
      </div>

      {/* Content: Only render when not collapsed */}
      {!collapsed && (
        <div className="overflow-y-auto flex-grow">
          {/* Notifications Section */}
          <div className="mb-4">
            <div className="flex justify-between cursor-pointer text-white" onClick={() => toggleSection('notifications')}>
              <h2 className="text-lg font-semibold">Notifications</h2>
              {isNotificationsOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isNotificationsOpen && (
              <ul className="mt-2 space-y-2">
                {notifications.map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 p-2 bg-[#2c2c2c] rounded cursor-pointer hover:bg-[#333]" onClick={() => handleItemClick(item)}>
                    <span className="flex-shrink-0">{item.icon}</span>
                    <div className="flex-grow">
                      <h3 className="text-sm font-semibold truncate">{item.title}</h3>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* News Section */}
          <div className="mb-4">
            <div className="flex justify-between cursor-pointer text-white" onClick={() => toggleSection('news')}>
              <h2 className="text-lg font-semibold">News Updates</h2>
              {isNewsUpdatesOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isNewsUpdatesOpen && (
              <ul className="mt-2 space-y-2">
                {newsUpdates.map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 p-2 bg-[#2c2c2c] rounded cursor-pointer hover:bg-[#333]" onClick={() => handleItemClick(item)}>
                    <span className="flex-shrink-0">{item.icon}</span>
                    <div className="flex-grow">
                      <h3 className="text-sm font-semibold truncate">{item.title}</h3>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Education Section */}
          <div className="mb-4">
            <div className="flex justify-between cursor-pointer text-white" onClick={() => toggleSection('education')}>
              <h2 className="text-lg font-semibold">Education</h2>
              {isEducationOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isEducationOpen && (
              <ul className="mt-2 space-y-2 flex-grow">
                {education.map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 p-2 bg-[#2c2c2c] rounded cursor-pointer hover:bg-[#333]" onClick={() => handleItemClick(item)}>
                    <span className="flex-shrink-0">{item.icon}</span>
                    <div className="flex-grow">
                      <h3 className="text-sm font-semibold truncate">{item.title}</h3>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Modal for displaying detailed information */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div className="bg-[#1c1c1c] max-w-screen-sm max-h-screen w-full md:w-1/3 p-6 rounded-lg shadow-lg relative overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-600" onClick={handleCloseModal}>
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedItem.title}</h2>
            <div className="max-h-80 overflow-y-auto">
              <p className="text-gray-700">{selectedItem.details}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaArrowLeft, FaArrowRight, FaBell, FaCloudDownloadAlt, FaExclamationCircle, FaBook, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { formatDistanceToNowStrict } from 'date-fns';
import { Sun, Zap, Radio, Shield, Satellite, AlertTriangle } from 'lucide-react';

interface SidebarItem {
  icon: JSX.Element;
  title: string;
  time: string;
  details: string;
  fullDetails: string;
}

interface Notification {
  id: number;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

interface RightSidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
  handleNotificationClick: () => void;
}

interface EducationItem {
  id: number;
  title: string;
  details: string;
  fullDetails: string;
  time: string;
  icon: string;
}

// src/types/sidebar.ts
export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  notification_type: string;
}

export interface NewsItem {
  icon: JSX.Element;
  title: string;
  time: string;
  details: string;
  fullDetails: string;
}

export interface SidebarItemProps {
  icon: JSX.Element;
  title: string;
  time: string;
  details: string;
  fullDetails: string;
  read?: boolean;
}

export interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
  handleNotificationClick: () => void;
}

export interface SidebarState {
  notifications: NotificationItem[];
  newsUpdates: NewsItem[];
  education: EducationItem[];
  selectedItem: NotificationItem | NewsItem | EducationItem | null;
  viewAllNotifications: boolean;
  viewAllNews: boolean;
  viewAllEducation: boolean;
}

export default function RightSidebar({ collapsed, toggleCollapse, handleNotificationClick }: RightSidebarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(true);
  const [isNewsUpdatesOpen, setIsNewsUpdatesOpen] = useState(true);
  const [isEducationOpen, setIsEducationOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [viewAllNotifications, setViewAllNotifications] = useState(false);
  const [viewAllNews, setViewAllNews] = useState(false);
  const [viewAllEducation, setViewAllEducation] = useState(false);
  const [spaceNews, setSpaceNews] = useState<SidebarItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  
  // Fetch notifications from the database
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();
        
        // Get read notifications from localStorage
        const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '{}');
        
        // Mark notifications as read if they're in localStorage
        const processedNotifications = data.map(notification => ({
          ...notification,
          read: readNotifications[notification.id] || false
        }));
        
        setNotifications(processedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleItemClick = async (item: any) => {
    setSelectedItem(item);
    
    if ('read' in item && !item.read) {
      try {
        // Store read state in localStorage
        const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '{}');
        readNotifications[item.id] = true;
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
        
        // Update local state
        setNotifications(notifications.map(notification => 
          notification.id === item.id ? { ...notification, read: true } : notification
        ));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    handleNotificationClick();
  };

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

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleAboutUsClick = () => {
    setIsAboutModalOpen(true);
  };

  const handleCloseAboutUsModal = () => {
    setIsAboutModalOpen(false);
  };
  // Space news fetch
  useEffect(() => {
    async function fetchSpaceNews() {
      try {
        const response = await fetch('https://api.spaceflightnewsapi.net/v4/articles?_limit=5');
        const data = await response.json();
        
        setSpaceNews(data.results.map((article: any) => ({
          icon: <Image src="/assets/images/OASIS_LOGO.png" width={20} height={20} alt="OASIS logo" />,
          title: article.title,
          time: formatDistanceToNowStrict(new Date(article.published_at), { addSuffix: true }),
          details: article.summary.length > 100
            ? `${article.summary.substring(0, 100)}...`
            : article.summary,
          fullDetails: `${article.summary} <br/><a href="${article.url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">Read full article</a>`
        })));
      } catch (error) {
        console.error("Error fetching space news:", error);
      }
    }
    fetchSpaceNews();
  }, []);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const response = await fetch('/api/education');
        if (!response.ok) throw new Error('Failed to fetch education data');
        const data: EducationItem[] = await response.json();
        setEducation(data);
      } catch (error) {
        console.error('Error fetching education data:', error);
      }
    };

    fetchEducation();
  }, []);

    const getIconComponent = (iconName: string): JSX.Element => {
      switch (iconName) {
        case 'sun':
          return <Sun color="white" />;
        case 'zap':
          return <Zap color="white" />;
        case 'radio':
          return <Radio color="white" />;
        case 'shield':
          return <Shield color="white" />;
        case 'satellite':
          return <Satellite color="white" />;
        case 'alert-triangle':
          return <AlertTriangle color="white" />;
        default:
          return <FaBook color="white" />;
      }
    };

  return (
    <div className={`h-screen bg-[#1c1c1c] p-4 transition-all duration-300 flex flex-col justify-start ${collapsed ? 'w-16' : 'w-72'} border-l border-gray-600`}>
      <div className="cursor-pointer text-white mb-4" onClick={toggleCollapse}>
        {collapsed ? <FaArrowLeft /> : <FaArrowRight />}
      </div>

      {!collapsed && (
        <div className="overflow-y-auto flex-grow">
          {/* Notifications Section */}
          <div className="mb-4">
            <div className="flex justify-between cursor-pointer text-white" onClick={() => toggleSection('notifications')}>
              <h2 className="text-lg font-semibold">Notifications</h2>
              {isNotificationsOpen ? <FaChevronUp/> : <FaChevronDown />}
            </div>
            {isNotificationsOpen && (
              <ul className="mt-2 space-y-2">
                {(viewAllNotifications ? notifications : notifications.slice(0, 4)).map((item) => (
                  <li 
                    key={item.id} 
                    className={`flex items-center space-x-2 p-2 ${item.read ? 'bg-[#222222]' : 'bg-[#2a2a2a] border-l-4 border-accent'} rounded cursor-pointer hover:bg-[#333]`}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className="flex-shrink-0">
                      <FaBell color="white"/>
                    </span>
                    <div className="flex-grow">
                      <h3 className="text-sm text-white font-semibold truncate">{item.title}</h3>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNowStrict(new Date(item.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </li>
                ))}
                {notifications.length > 4 && (
                  <div 
                    className="text-xs text-blue-400 cursor-pointer hover:underline"
                    onClick={() => setViewAllNotifications(!viewAllNotifications)}
                  >
                    {viewAllNotifications ? 'View Less' : 'View All'}
                  </div>
                )}
              </ul>
            )}
          </div>

          {/* News Updates Section */}
          <div className="mb-4">
            <div className="flex justify-between cursor-pointer text-white" onClick={() => toggleSection('news')}>
              <h2 className="text-lg font-semibold">News Updates</h2>
              {isNewsUpdatesOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isNewsUpdatesOpen && (
              <ul className="mt-2 space-y-2">
                {(viewAllNews ? spaceNews : spaceNews.slice(0, 4)).map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 p-2 bg-[#222222] rounded cursor-pointer hover:bg-[#333]" onClick={() => handleItemClick(item)}>
                    <span className="flex-shrink-0">{item.icon}</span>
                    <div className="flex-grow overflow-hidden">
                      <h3 className="text-sm text-white font-semibold truncate">{item.title}</h3>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                  </li>
                ))}
                {spaceNews.length > 4 && (
                  <div className="text-xs text-blue-400 cursor-pointer hover:underline" onClick={() => setViewAllNews(!viewAllNews)}>
                    {viewAllNews ? 'View Less' : 'View All'}
                  </div>
                )}
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
                <ul className="mt-2 space-y-2">
                  {/* Check if education is an array and map over it */}
                  {Array.isArray(education) && education.length > 0 ? (
                    (viewAllEducation ? education : education.slice(0, 4)).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center space-x-2 p-2 bg-[#222222] rounded cursor-pointer hover:bg-[#333]"
                        onClick={() => handleItemClick(item)}
                      >
                        <span className="flex-shrink-0">{getIconComponent(item.icon)}</span>
                        <div className="flex-grow">
                          <h3 className="text-sm text-white font-semibold truncate">{item.title}</h3>
                          <p className="text-xs text-gray-400">{item.time}</p>
                        </div>
                      </li>
                    ))
                  ) : (
                    // Fallback message for empty or invalid data
                    <p className="text-gray-400">No education items available.</p>
                  )}
                  {/* Toggle "View All" or "View Less" if more than 4 items exist */}
                  {Array.isArray(education) && education.length > 4 && (
                    <div
                      className="text-xs text-blue-400 cursor-pointer hover:underline"
                      onClick={() => setViewAllEducation(!viewAllEducation)}
                    >
                      {viewAllEducation ? 'View Less' : 'View All'}
                    </div>
                  )}
                </ul>
              )}
            </div>
        </div>
      )}

      {/* Selected Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div className="bg-[#1c1c1c] max-w-screen-sm max-h-screen w-full md:w-1/3 p-6 rounded-lg shadow-lg relative overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-600" onClick={handleCloseModal}>
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">{selectedItem.title}</h2>
            <div className="max-h-80 overflow-y-auto text-white">
              <p dangerouslySetInnerHTML={{ __html: selectedItem.body || selectedItem.fullDetails }}/>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseAboutUsModal}>
          <div className="bg-[#1c1c1c] max-w-screen-sm max-h-screen w-full md:w-1/3 p-6 rounded-lg shadow-lg relative overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-600" onClick={handleCloseAboutUsModal}>
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">About the Development Team</h2>
            <div className="max-h-80 overflow-y-auto">
              <p className="text-gray-400">Our team of skilled developers from the University of Texas at Dallas crafted the O.A.S.I.S platform to help space research and exploration. With a passion for technology and innovation, we strive to deliver the best solutions for space-based applications.</p>
              <ul className="mt-4 text-gray-400">
                <li>Project Lead: Josh Duke</li>
                <li>Data Scientist: Ashlynn Norris</li>
                <li>Data Engineer: Tsion Yigzaw</li>
                <li>Frontend Developer: Clara Connor</li>
                <li>Backend Developer: Al Altaay</li>
                <li>Find us on youtube: https://www.youtube.com/@ProjectOASIS-p7z</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="text-white text-center mb-4 underline cursor-pointer" onClick={handleAboutUsClick}>
          About Us
        </div>
      )}
    </div>
  );
}
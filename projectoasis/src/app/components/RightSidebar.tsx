'use client';

import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaArrowLeft, FaArrowRight, FaBell, FaCloudDownloadAlt, FaExclamationCircle, FaBook, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { formatDistanceToNowStrict } from 'date-fns';

interface SidebarItem {
  icon: JSX.Element;
  title: string;
  time: string;
  details: string;
  fullDetails: string;
}

interface RightSidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
  handleNotificationClick: () => void; // Function to reduce the notification count
}

const notifications = [
  { icon: <FaBell color="white"/>, title: 'You fixed a bug.', time: 'Just now', details: 'Detailed information about the bug fix.' },
  { icon: <FaExclamationCircle color="white"/>, title: 'Dataset Updated.', time: '59 minutes ago', details: 'Details about the dataset update.' },
  { icon: <FaCloudDownloadAlt color="white"/>, title: 'A New Update is Available!', time: '12 hours ago', details: 'Details about the latest update.' },
  { icon: <FaCloudDownloadAlt color="white"/>, title: 'Another Update!', time: '12 hours ago', details: 'Details about another update.' },
  { icon: <FaCloudDownloadAlt color="white"/>, title: 'Yet Another Update!', time: '12 hours ago', details: 'Details about yet another update.' },
  { icon: <FaCloudDownloadAlt color="white"/>, title: 'Last Update!', time: '12 hours ago', details: 'Details about the last update.' },
];

const education = [
  { icon: <FaBook color="white"/>, title: 'Getting Started with OASIS...', time: 'Just now', details: 'Learn how to get started with OASIS...' },
  { icon: <FaBook color="white"/>, title: 'Understanding NEOs...', time: '59 minutes ago', details: 'Understanding Near Earth Objects (NEOs)...' },
  { icon: <FaBook color="white"/>, title: 'Satellite Tracking 101...', time: '3 hours ago', details: 'Basics of satellite tracking and its importance.' },
  { icon: <FaBook color="white"/>, title: 'Space Debris Management...', time: '4 hours ago', details: 'How to manage space debris and keep space safe.' },
  { icon: <FaBook color="white"/>, title: 'Climate Effects on Space...', time: '12 hours ago', details: 'Impact of climate on space weather and satellites.' },
];

export default function RightSidebar({ collapsed, toggleCollapse, handleNotificationClick }: RightSidebarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(true);
  const [isNewsUpdatesOpen, setIsNewsUpdatesOpen] = useState(true);
  const [isEducationOpen, setIsEducationOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SidebarItem | null>(null); // Track the clicked item for the modal
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false); // Track the About Us modal
  const [viewAllNotifications, setViewAllNotifications] = useState(false);
  const [viewAllNews, setViewAllNews] = useState(false);
  const [viewAllEducation, setViewAllEducation] = useState(false);
  const [spaceNews, setSpaceNews] = useState([])

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

  // Handle clicking a notification item
  const handleItemClick = (item: SidebarItem) => {
    setSelectedItem(item);          // Set the selected item (for modal display)
    handleNotificationClick();      // Call the parent's function to reduce the notification count
  };

  const handleCloseModal = () => {
    setSelectedItem(null); // Close the notification or education modal
  };

  const handleAboutUsClick = () => {
    setIsAboutModalOpen(true); // Open the About Us modal
  };

  const handleCloseAboutUsModal = () => {
    setIsAboutModalOpen(false); // Close the About Us modal
  };

  useEffect(() => {
    async function fetchSpaceNews() {
      try {
        const response = await fetch('https://api.spaceflightnewsapi.net/v4/articles?_limit=5');
        const data = await response.json();
        console.log("Fetched data:", data); 
        setSpaceNews(data.results.map(article => ({
          icon: <Image src="/assets/images/OASIS_LOGO.png" width={20} height={20} alt="OASIS logo" />,
          title: article.title,
          time: formatDistanceToNowStrict(new Date(article.published_at), { addSuffix: true }),
          details: article.summary.length > 100
          ? `${article.summary.substring(0, 100)}... <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">Read more</a>`
          : `${article.summary} <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">Read more</a>`, 
          fullDetails: `${article.summary} <br/><a href="${article.url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">Read full article</a>`, // Full description for modal
        })));
      } catch (error) {
        console.error("Error fetching space news:", error);
      }
    }
    fetchSpaceNews();
  }, []);

  return (
    <div className={`h-screen bg-[#1c1c1c] p-4 transition-all duration-300 flex flex-col justify-start ${collapsed ? 'w-16' : 'w-72'} border-l border-gray-600`}>
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
              {isNotificationsOpen ? <FaChevronUp/> : <FaChevronDown />}
            </div>
            {isNotificationsOpen && (
              <ul className="mt-2 space-y-2">
                {(viewAllNotifications ? notifications : notifications.slice(0, 4)).map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 p-2 bg-[#222222] rounded cursor-pointer hover:bg-[#333]" onClick={() => handleItemClick(item)}>
                    <span className="flex-shrink-0">{item.icon}</span>
                    <div className="flex-grow">
                      <h3 className="text-sm text-white font-semibold truncate">{item.title}</h3>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                  </li>
                ))}
                {notifications.length > 4 && (
                  <div className="text-xs text-blue-400 cursor-pointer hover:underline" onClick={() => setViewAllNotifications(!viewAllNotifications)}>
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
                      <h3 className="text-sm font-semibold truncate">{item.title}</h3>
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
                {(viewAllEducation ? education : education.slice(0, 4)).map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 p-2 bg-[#222222] rounded cursor-pointer hover:bg-[#333]" onClick={() => handleItemClick(item)}>
                    <span className="flex-shrink-0">{item.icon}</span>
                    <div className="flex-grow">
                      <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                  </li>
                ))}
                {education.length > 4 && (
                  <div className="text-xs text-blue-400 cursor-pointer hover:underline" onClick={() => setViewAllEducation(!viewAllEducation)}>
                    {viewAllEducation ? 'View Less' : 'View All'}
                  </div>
                )}
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
            <h2 className="text-2xl font-bold text-white mb-4">{selectedItem.title}</h2>
            <div className="max-h-80 overflow-y-auto">
              <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: selectedItem.fullDetails }}/>
            </div>
          </div>
        </div>
      )}

      {/* Modal for About Us Section */}
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
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* About Us Button (Centered at the Bottom) */}
      {!collapsed && (
        <div className="text-white text-center mb-4 underline cursor-pointer" onClick={handleAboutUsClick}>
          About Us
        </div>
      )}
    </div>
  );
}

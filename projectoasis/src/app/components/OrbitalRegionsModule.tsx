import React, { useState } from 'react';

const OrbitalRegionsModule = () => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const ringColors = {
    ring1: { stroke: '#0096FF', hover: 'rgba(0, 150, 255, 0.5)' },
    ring2: { stroke: '#00C8FF', hover: 'rgba(0, 200, 255, 0.5)' },
    ring3: { stroke: '#00FFDC', hover: 'rgba(0, 255, 220, 0.5)' }
  };

  const handleMouseOver = (region: string) => {
    setHoveredRegion(region);
  };

  const handleMouseOut = () => {
    setHoveredRegion(null);
  };

  const handleClick = (region: string) => {
    alert(`Selected region: ${region}`);
  };

  const getRingColor = (ring: number, isHovered: boolean) => {
    const ringKey = `ring${ring}` as keyof typeof ringColors;
    return isHovered ? ringColors[ringKey].hover : 'transparent';
  };

  return (
    <div className="min-h-screen w-full overflow-hidden">
    <style jsx global>{`
        /* Custom Scrollbar Style */
        .orbital-regions-container {
          overflow: auto;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #2d2d34;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #36a2eb;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: #2e7cbf;
        }
    `}</style>
      {/* Title in top left */}
      <div className="absolute top-6 left-6 text-3xl font-bold text-white">
        Near Earth Space Regions
      </div>

      {/* Main container with SVG */}
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-[90vmin] h-[90vmin] relative">
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 1000 1000" 
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background rings */}
            <circle cx="500" cy="500" r="250" fill="transparent" stroke={ringColors.ring1.stroke} strokeWidth="3" />
            <circle cx="500" cy="500" r="375" fill="transparent" stroke={ringColors.ring2.stroke} strokeWidth="3" />
            <circle cx="500" cy="500" r="500" fill="transparent" stroke={ringColors.ring3.stroke} strokeWidth="3" />

            {/* Quadrant Division Lines */}
            <line x1="500" y1="0" x2="500" y2="1000" stroke="#333" strokeWidth="2" />
            <line x1="0" y1="500" x2="1000" y2="500" stroke="#333" strokeWidth="2" />

            {/* Quadrant 1 (Top Right) */}
            <path
              d="M 500,500 L 500,250 A 250,250 0 0,1 750,500 L 500,500"
              fill={getRingColor(1, hoveredRegion === '1A')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('1A')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('1A')}
            />
            <path
              d="M 500,250 L 500,125 A 375,375 0 0,1 875,500 L 750,500 A 250,250 0 0,0 500,250"
              fill={getRingColor(2, hoveredRegion === '2A')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('2A')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('2A')}
            />
            <path
              d="M 500,125 L 500,0 A 500,500 0 0,1 1000,500 L 875,500 A 375,375 0 0,0 500,125"
              fill={getRingColor(3, hoveredRegion === '3A')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('3A')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('3A')}
            />

            {/* Quadrant 2 (Bottom Right) */}
            <path
              d="M 500,500 L 750,500 A 250,250 0 0,1 500,750 L 500,500"
              fill={getRingColor(1, hoveredRegion === '1B')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('1B')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('1B')}
            />
            <path
              d="M 750,500 L 875,500 A 375,375 0 0,1 500,875 L 500,750 A 250,250 0 0,0 750,500"
              fill={getRingColor(2, hoveredRegion === '2B')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('2B')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('2B')}
            />
            <path
              d="M 875,500 L 1000,500 A 500,500 0 0,1 500,1000 L 500,875 A 375,375 0 0,0 875,500"
              fill={getRingColor(3, hoveredRegion === '3B')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('3B')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('3B')}
            />

            {/* Quadrant 3 (Bottom Left) */}
            <path
              d="M 500,500 L 500,750 A 250,250 0 0,1 250,500 L 500,500"
              fill={getRingColor(1, hoveredRegion === '1C')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('1C')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('1C')}
            />
            <path
              d="M 500,750 L 500,875 A 375,375 0 0,1 125,500 L 250,500 A 250,250 0 0,0 500,750"
              fill={getRingColor(2, hoveredRegion === '2C')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('2C')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('2C')}
            />
            <path
              d="M 500,875 L 500,1000 A 500,500 0 0,1 0,500 L 125,500 A 375,375 0 0,0 500,875"
              fill={getRingColor(3, hoveredRegion === '3C')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('3C')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('3C')}
            />

            {/* Quadrant 4 (Top Left) */}
            <path
              d="M 500,500 L 250,500 A 250,250 0 0,1 500,250 L 500,500"
              fill={getRingColor(1, hoveredRegion === '1D')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('1D')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('1D')}
            />
            <path
              d="M 250,500 L 125,500 A 375,375 0 0,1 500,125 L 500,250 A 250,250 0 0,0 250,500"
              fill={getRingColor(2, hoveredRegion === '2D')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('2D')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('2D')}
            />
            <path
              d="M 125,500 L 0,500 A 500,500 0 0,1 500,0 L 500,125 A 375,375 0 0,0 125,500"
              fill={getRingColor(3, hoveredRegion === '3D')}
              className="cursor-pointer"
              onMouseOver={() => handleMouseOver('3D')}
              onMouseOut={handleMouseOut}
              onClick={() => handleClick('3D')}
            />

            {/* Earth circle */}
            <circle cx="500" cy="500" r="62.5" fill="#4B4B4B" stroke="#666" strokeWidth="2" />
            <text x="500" y="506" textAnchor="middle" className="text-sm fill-white font-bold">Earth</text>

            {/* Region Labels */}
            <text x="625" y="375" textAnchor="middle" className="text-lg fill-white">1A</text>
            <text x="687" y="312" textAnchor="middle" className="text-lg fill-white">2A</text>
            <text x="750" y="250" textAnchor="middle" className="text-lg fill-white">3A</text>
            
            <text x="625" y="625" textAnchor="middle" className="text-lg fill-white">1B</text>
            <text x="687" y="687" textAnchor="middle" className="text-lg fill-white">2B</text>
            <text x="750" y="750" textAnchor="middle" className="text-lg fill-white">3B</text>
            
            <text x="375" y="625" textAnchor="middle" className="text-lg fill-white">1C</text>
            <text x="312" y="687" textAnchor="middle" className="text-lg fill-white">2C</text>
            <text x="250" y="750" textAnchor="middle" className="text-lg fill-white">3C</text>
            
            <text x="375" y="375" textAnchor="middle" className="text-lg fill-white">1D</text>
            <text x="312" y="312" textAnchor="middle" className="text-lg fill-white">2D</text>
            <text x="250" y="250" textAnchor="middle" className="text-lg fill-white">3D</text>

            {/* Hovered Region Display */}
            {hoveredRegion && (
              <text x="500" y="975" textAnchor="middle" className="text-base fill-white">
                Region {hoveredRegion}
              </text>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default OrbitalRegionsModule;
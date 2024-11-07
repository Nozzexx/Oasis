import React, { useState } from 'react';
import './styles/OrbitalRegionsModule.css';// Ensure this CSS file is in the same directory or adjust the path accordingly

const OrbitalRegionsModule: React.FC = () => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const handleMouseOver = (segment: string) => {
    setHoveredSegment(segment);
  };

  const handleMouseOut = () => {
    setHoveredSegment(null);
  };

  const handleClick = (segment: string) => {
    alert(`You clicked on ${segment}`);
  };

  return (
    <div className="orbital-regions-container">
      <h2>Near-Earth Space Sectors</h2>
      <div className="svg-wrapper">
        <svg width="100%" height="100%" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet">
          {/* Earth Circle */}
          <circle cx="400" cy="400" r="50" fill="#4B4B4B" />
          <text x="400" y="405" textAnchor="middle" fontSize="16" fill="#FFFFFF" fontWeight="bold">Earth</text>

          {/* Ring outlines */}
          <circle cx="400" cy="400" r="200" fill="none" stroke="#2196F3" strokeWidth="2" />
          <circle cx="400" cy="400" r="300" fill="none" stroke="#00ACC1" strokeWidth="2" />
          <circle cx="400" cy="400" r="400" fill="none" stroke="#00897B" strokeWidth="2" />

          {/* Quadrant Lines */}
          <line x1="400" y1="0" x2="400" y2="800" stroke="#9E9E9E" strokeDasharray="4" />
          <line x1="0" y1="400" x2="800" y2="400" stroke="#9E9E9E" strokeDasharray="4" />

          {/* Interactive Quadrants - 1/4 sections of each ring */}
          {/* LEO Quadrants */}
          <path
            d="M 400,400 L 400,200 A 200,200 0 0,1 600,400 Z"
            fill={hoveredSegment === 'LEO-Q1' ? 'rgba(33, 150, 243, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('LEO-Q1')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('LEO-Q1')}
          />
          <path
            d="M 400,400 L 600,400 A 200,200 0 0,1 400,600 Z"
            fill={hoveredSegment === 'LEO-Q2' ? 'rgba(33, 150, 243, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('LEO-Q2')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('LEO-Q2')}
          />
          <path
            d="M 400,400 L 400,600 A 200,200 0 0,1 200,400 Z"
            fill={hoveredSegment === 'LEO-Q3' ? 'rgba(33, 150, 243, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('LEO-Q3')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('LEO-Q3')}
          />
          <path
            d="M 400,400 L 200,400 A 200,200 0 0,1 400,200 Z"
            fill={hoveredSegment === 'LEO-Q4' ? 'rgba(33, 150, 243, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('LEO-Q4')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('LEO-Q4')}
          />

          {/* MEO Quadrants */}
          <path
            d="M 400,400 L 400,100 A 300,300 0 0,1 700,400 Z"
            fill={hoveredSegment === 'MEO-Q1' ? 'rgba(0, 172, 193, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('MEO-Q1')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('MEO-Q1')}
          />
          <path
            d="M 400,400 L 700,400 A 300,300 0 0,1 400,700 Z"
            fill={hoveredSegment === 'MEO-Q2' ? 'rgba(0, 172, 193, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('MEO-Q2')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('MEO-Q2')}
          />
          <path
            d="M 400,400 L 400,700 A 300,300 0 0,1 100,400 Z"
            fill={hoveredSegment === 'MEO-Q3' ? 'rgba(0, 172, 193, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('MEO-Q3')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('MEO-Q3')}
          />
          <path
            d="M 400,400 L 100,400 A 300,300 0 0,1 400,100 Z"
            fill={hoveredSegment === 'MEO-Q4' ? 'rgba(0, 172, 193, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('MEO-Q4')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('MEO-Q4')}
          />

          {/* GEO Quadrants */}
          <path
            d="M 400,400 L 400,0 A 400,400 0 0,1 800,400 Z"
            fill={hoveredSegment === 'GEO-Q1' ? 'rgba(0, 137, 123, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('GEO-Q1')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('GEO-Q1')}
          />
          <path
            d="M 400,400 L 800,400 A 400,400 0 0,1 400,800 Z"
            fill={hoveredSegment === 'GEO-Q2' ? 'rgba(0, 137, 123, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('GEO-Q2')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('GEO-Q2')}
          />
          <path
            d="M 400,400 L 400,800 A 400,400 0 0,1 0,400 Z"
            fill={hoveredSegment === 'GEO-Q3' ? 'rgba(0, 137, 123, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('GEO-Q3')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('GEO-Q3')}
          />
          <path
            d="M 400,400 L 0,400 A 400,400 0 0,1 400,0 Z"
            fill={hoveredSegment === 'GEO-Q4' ? 'rgba(0, 137, 123, 0.5)' : 'transparent'}
            onMouseOver={() => handleMouseOver('GEO-Q4')}
            onMouseOut={handleMouseOut}
            onClick={() => handleClick('GEO-Q4')}
          />

          {/* Labels for each sector in between the circles */}
          <text x="325" y="325" textAnchor="middle" fontSize="24" fill="#FFD700">1A</text>
          <text x="475" y="325" textAnchor="middle" fontSize="24" fill="#FFD700">1B</text>
          <text x="325" y="500" textAnchor="middle" fontSize="24" fill="#FFD700">1C</text>
          <text x="475" y="500" textAnchor="middle" fontSize="24" fill="#FFD700">1D</text>

          <text x="250" y="175" textAnchor="middle" fontSize="24" fill="#FF8C00">2A</text>
          <text x="550" y="175" textAnchor="middle" fontSize="24" fill="#FF8C00">2B</text>
          <text x="250" y="625" textAnchor="middle" fontSize="24" fill="#FF8C00">2C</text>
          <text x="550" y="625" textAnchor="middle" fontSize="24" fill="#FF8C00">2D</text>

          <text x="150" y="100" textAnchor="middle" fontSize="24" fill="#00FF7F">3A</text>
          <text x="650" y="100" textAnchor="middle" fontSize="24" fill="#00FF7F">3B</text>
          <text x="150" y="700" textAnchor="middle" fontSize="24" fill="#00FF7F">3C</text>
          <text x="650" y="700" textAnchor="middle" fontSize="24" fill="#00FF7F">3D</text>

          {/* Display hovered segment name */}
          {hoveredSegment && (
            <text x="400" y="780" textAnchor="middle" fontSize="16" fill="#333">
              {hoveredSegment}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
};

export default OrbitalRegionsModule;
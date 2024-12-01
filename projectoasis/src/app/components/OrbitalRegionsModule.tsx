import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface EnvironmentalData {
  risk_score: number;
  flare_risk: number;
  cme_risk: number;
  storm_risk: number;
  debris_risk: number;
  data_status: string;
  confidence_score: number;
}

interface EnvironmentalPanelProps {
  data: EnvironmentalData | null;
  loading: boolean;
  error: string | null;
}

// Helper function to safely format numbers
const safeNumberFormat = (value: any): string => {
  const num = Number(value);
  return !isNaN(num) ? num.toFixed(1) : '0.0';
};

const OrbitalRegionsModule = () => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ringColors = {
    ring1: { stroke: '#0096FF', hover: 'rgba(0, 150, 255, 0.5)' },
    ring2: { stroke: '#00C8FF', hover: 'rgba(0, 200, 255, 0.5)' },
    ring3: { stroke: '#00FFDC', hover: 'rgba(0, 255, 220, 0.5)' }
  };

  useEffect(() => {
    if (selectedRegion) {
      fetchEnvironmentalData(selectedRegion);
    }
  }, [selectedRegion]);

  const fetchEnvironmentalData = async (region: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/environmental-scores?region=${region}&limit=1`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const rawData = await response.json();
      const data = rawData[0];

      // Transform and validate the data
      if (data) {
        const transformedData: EnvironmentalData = {
          risk_score: Number(data.risk_score) || 0,
          flare_risk: Number(data.flare_risk) || 0,
          cme_risk: Number(data.cme_risk) || 0,
          storm_risk: Number(data.storm_risk) || 0,
          debris_risk: Number(data.debris_risk) || 0,
          data_status: String(data.data_status || 'Unknown'),
          confidence_score: Number(data.confidence_score) || 0
        };
        setEnvironmentalData(transformedData);
      } else {
        setEnvironmentalData(null);
      }
    } catch (err) {
      setError('Failed to load environmental data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseOver = (region: string) => {
    setHoveredRegion(region);
  };

  const handleMouseOut = () => {
    setHoveredRegion(null);
  };

  const handleClick = (region: string) => {
    setSelectedRegion(region);
  };

  const getRingColor = (ring: number, isHovered: boolean) => {
    const ringKey = `ring${ring}` as keyof typeof ringColors;
    return isHovered ? ringColors[ringKey].hover : 'transparent';
  };

  // Component for displaying environmental data
  const EnvironmentalPanel: React.FC<EnvironmentalPanelProps> = ({ data, loading, error }) => {
    if (!data && !loading && !error) return null;

    return (
      <div className="absolute top-6 right-6 w-80 bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-bold">
            Region {selectedRegion} Status
          </h3>
        </div>
        
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {data && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Overall Risk Score:</span>
                <span className="text-xl font-bold text-blue-400">
                  {safeNumberFormat(data.risk_score)}
                </span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold mb-2">Risk Breakdown:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Solar Flare Risk:</div>
                  <div className="text-right">{safeNumberFormat(data.flare_risk)}</div>
                  <div>CME Risk:</div>
                  <div className="text-right">{safeNumberFormat(data.cme_risk)}</div>
                  <div>Storm Risk:</div>
                  <div className="text-right">{safeNumberFormat(data.storm_risk)}</div>
                  <div>Debris Risk:</div>
                  <div className="text-right">{safeNumberFormat(data.debris_risk)}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between items-center text-sm">
                  <span>Confidence Score:</span>
                  <span className="font-medium">{safeNumberFormat(data.confidence_score)}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Data Status:</span>
                  <span className="font-medium">{data.data_status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen w-full overflow-hidden">
      <style jsx global>{`
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

      {/* Environmental Data Panel */}
      <EnvironmentalPanel 
        data={environmentalData}
        loading={loading}
        error={error}
      />

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
            <text x="630" y="380" textAnchor="middle" className="text-lg fill-white">1A</text>
            <text x="730" y="280" textAnchor="middle" className="text-lg fill-white">2A</text>
            <text x="830" y="180" textAnchor="middle" className="text-lg fill-white">3A</text>
            
            <text x="630" y="630" textAnchor="middle" className="text-lg fill-white">1B</text>
            <text x="730" y="730" textAnchor="middle" className="text-lg fill-white">2B</text>
            <text x="830" y="830" textAnchor="middle" className="text-lg fill-white">3B</text>
            
            <text x="380" y="630" textAnchor="middle" className="text-lg fill-white">1C</text>
            <text x="280" y="730" textAnchor="middle" className="text-lg fill-white">2C</text>
            <text x="180" y="830" textAnchor="middle" className="text-lg fill-white">3C</text>
            
            <text x="380" y="380" textAnchor="middle" className="text-lg fill-white">1D</text>
            <text x="280" y="280" textAnchor="middle" className="text-lg fill-white">2D</text>
            <text x="180" y="180" textAnchor="middle" className="text-lg fill-white">3D</text>

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
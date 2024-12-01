'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search, Play, Pause, RotateCw } from 'lucide-react';

interface Exoplanet {
  planet_name: string;
  host_star: string;
  discovery_method: string;
  orbital_period: number | null;
  planet_radius: number | null;
  mass: number | null;
  semi_major_axis: number | null;
  discovery_year: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface PlanetarySystemProps {
  planet: Exoplanet;
  speed: number;
  isPlaying: boolean;
}

const PlanetarySystem: React.FC<PlanetarySystemProps> = ({ planet, speed, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [angle, setAngle] = useState(0);

  // Constants
  const CANVAS_SIZE = 400; // Fixed canvas size
  const STAR_RADIUS = 50; // Fixed star size
  const MIN_PLANET_RADIUS = STAR_RADIUS * 0.05; // 5% of star size
  const MAX_PLANET_RADIUS = STAR_RADIUS * 0.3; // 30% of star size
  const ORBIT_RADIUS = 150; // Fixed orbit size

  // Calculate planet radius dynamically, within bounds
  const calculatePlanetRadius = (planetRadiusInEarthRadii: number | null): number => {
    if (!planetRadiusInEarthRadii) return MIN_PLANET_RADIUS; // Default to minimum size
    const scaleFactor = STAR_RADIUS / 10; // Scale based on Earth's radius
    const scaledRadius = planetRadiusInEarthRadii * scaleFactor;
    return Math.max(MIN_PLANET_RADIUS, Math.min(MAX_PLANET_RADIUS, scaledRadius)); // Clamp size
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    const planetRadius = calculatePlanetRadius(planet.planet_radius);

    const animate = () => {
      if (!ctx || !isPlaying) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw star
      ctx.beginPath();
      ctx.fillStyle = '#FFD700'; // Yellow star
      ctx.arc(centerX, centerY, STAR_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Draw orbit path
      ctx.beginPath();
      ctx.strokeStyle = '#444'; // Gray orbit
      ctx.arc(centerX, centerY, ORBIT_RADIUS, 0, Math.PI * 2);
      ctx.stroke();

      // Calculate planet position
      const planetX = centerX + Math.cos(angle) * ORBIT_RADIUS;
      const planetY = centerY + Math.sin(angle) * ORBIT_RADIUS;

      // Draw planet
      ctx.beginPath();
      ctx.fillStyle = '#36A2EB'; // Blue planet
      ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
      ctx.fill();

      // Add scale indicators
      ctx.font = '12px Arial';
      ctx.fillStyle = '#ffffff';
      if (planet.planet_radius) {
        ctx.fillText(`${planet.planet_radius}R⊕`, 10, 20);
      }
      if (planet.semi_major_axis) {
        ctx.fillText(`${planet.semi_major_axis}AU`, 10, 40);
      }

      // Update angle for animation
      setAngle((prev) => (prev + (0.002 * speed)) % (Math.PI * 2));
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [angle, planet.planet_radius, speed, isPlaying]);

  useEffect(() => {
    if (!isPlaying && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const planetRadius = calculatePlanetRadius(planet.planet_radius);

      // Draw star
      ctx.beginPath();
      ctx.fillStyle = '#FFD700'; // Yellow star
      ctx.arc(centerX, centerY, STAR_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Draw orbit path
      ctx.beginPath();
      ctx.strokeStyle = '#444'; // Gray orbit
      ctx.arc(centerX, centerY, ORBIT_RADIUS, 0, Math.PI * 2);
      ctx.stroke();

      // Draw planet at current position
      const planetX = centerX + Math.cos(angle) * ORBIT_RADIUS;
      const planetY = centerY + Math.sin(angle) * ORBIT_RADIUS;
      ctx.beginPath();
      ctx.fillStyle = '#36A2EB'; // Blue planet
      ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
      ctx.fill();

      // Add scale indicators
      ctx.font = '12px Arial';
      ctx.fillStyle = '#ffffff';
      if (planet.planet_radius) {
        ctx.fillText(`${planet.planet_radius}R⊕`, 10, 20);
      }
      if (planet.semi_major_axis) {
        ctx.fillText(`${planet.semi_major_axis}AU`, 10, 40);
      }
    }
  }, [isPlaying, angle, planet.planet_radius]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="w-full h-full"
    />
  );
};


export default function ExoplanetModule() {
  const [exoplanets, setExoplanets] = useState<Exoplanet[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const fetchExoplanets = async () => {
      try {
        const response = await fetch('/api/exoplanet');
        if (!response.ok) {
          throw new Error(`Failed to fetch exoplanet data: ${response.statusText}`);
        }
        const data = await response.json();
        setExoplanets(data);
        if (data.length > 0) setSelectedPlanet(data[0]);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExoplanets();
  }, []);

  const resetAnimation = () => {
    setIsPlaying(true);
    setSpeed(1);
  };

  const filteredPlanets = exoplanets.filter(planet => 
    planet.planet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    planet.host_star.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading exoplanet data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white h-full">
      <h1 className="text-3xl font-bold mb-6">Exoplanet Exploration</h1>
      <p className="mb-8">
        Explore fascinating information about exoplanets, their discovery methods, and characteristics.
      </p>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search planets or stars..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#2c2c2c] text-white px-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      <div className="flex gap-6 h-[calc(100vh-300px)]">
        {/* Planet List */}
        <div className="w-1/3 bg-[#2c2c2c] rounded-lg p-4 overflow-y-auto">
          <div className="space-y-2">
            {filteredPlanets.map((planet, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedPlanet?.planet_name === planet.planet_name
                    ? 'bg-blue-500/20 border border-blue-500'
                    : 'hover:bg-[#363636]'
                }`}
                onClick={() => setSelectedPlanet(planet)}
              >
                <h3 className="font-semibold">{planet.planet_name}</h3>
                <p className="text-sm text-gray-400">{planet.host_star}</p>
                {planet.discovery_year && (
                  <p className="text-xs text-gray-500">Discovered: {planet.discovery_year}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-2/3 flex flex-col gap-6">
          {/* Orbital Visualization with Title */}
          <div className="h-[600px] bg-[#2c2c2c] rounded-lg p-4">
            {selectedPlanet && (
              <>
                <h2 className="text-2xl font-bold text-center mb-4">
                  {selectedPlanet.planet_name}
                </h2>
                <div className="h-[450px] flex items-center justify-center">
                  <div className="w-[400px] h-[400px]">
                    <PlanetarySystem 
                      planet={selectedPlanet} 
                      speed={speed}
                      isPlaying={isPlaying}
                    />
                  </div>
                </div>
                {/* Animation Controls */}
                <div className="mt-4 flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button
                    onClick={resetAnimation}
                    className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
                  >
                    <RotateCw size={20} />
                  </button>
                  <div className="flex items-center space-x-2 flex-1 max-w-xs">
                    <span className="text-sm">Speed:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm">{speed.toFixed(1)}x</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Planet Details */}
          <div className="h-64 bg-[#2c2c2c] rounded-lg p-6">
            {selectedPlanet && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">
                    <span className="font-semibold">Host Star:</span><br />
                    {selectedPlanet.host_star || 'Unknown'}
                  </p>
                  <p className="text-gray-400 mt-2">
                    <span className="font-semibold">Discovery Method:</span><br />
                    {selectedPlanet.discovery_method || 'Unknown'}
                  </p>
                  <p className="text-gray-400 mt-2">
                    <span className="font-semibold">Discovery Year:</span><br />
                    {selectedPlanet.discovery_year || 'Unknown'}
                  </p>
                  <p className="text-gray-400 mt-2">
                    <span className="font-semibold">Orbital Period:</span><br />
                    {selectedPlanet.orbital_period ? `${selectedPlanet.orbital_period} days` : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">
                    <span className="font-semibold">Planet Radius:</span><br />
                    {selectedPlanet.planet_radius ? `${selectedPlanet.planet_radius} R⊕` : 'Unknown'}
                  </p>
                  <p className="text-gray-400 mt-2">
                    <span className="font-semibold">Mass:</span><br />
                    {selectedPlanet.mass ? `${selectedPlanet.mass} M⊕` : 'Unknown'}
                  </p>
                  <p className="text-gray-400 mt-2">
                    <span className="font-semibold">Semi-Major Axis:</span><br />
                    {selectedPlanet.semi_major_axis ? `${selectedPlanet.semi_major_axis} AU` : 'Unknown'}
                  </p>
                  <p className="text-gray-400 mt-2">
                    <span className="font-semibold">Last Updated:</span><br />
                    {selectedPlanet.updated_at ? new Date(selectedPlanet.updated_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
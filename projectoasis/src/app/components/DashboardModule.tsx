'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FiSunrise } from 'react-icons/fi';
import { GiSunRadiations } from 'react-icons/gi';
import { TbSunElectricity } from 'react-icons/tb';
import { AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

// Types for database response
interface DashboardData {
  activeSatellites: {
    count: number;
    percentageChange: number;
  };
  trackedDebris: {
    count: number;
    percentageChange: number;
  }
  rocketBodies: {
    count: number;
    percentageChange: number;
  }
  totalTracked: {
    count: number;
    percentageChange: number;
  }
  yearComparison: {
    month: string;
    current_year_count: number;
    prior_year_count: number;
  }[];
  topCountries: {
    country: string;
    active_payload_count: number;
  }[];
}

interface NEOData {
  id: string;
  name: string;
  observation_date: string;
  estimated_diameter_km: number;
  is_potentially_hazardous: boolean;
}


interface ApproachData {
  close_approach_date: string;
  relative_velocity_kph: number;
  miss_distance_km: number;
}


const calculateSlightPercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0; // Avoid division by zero
  return ((current - previous) / previous) * 100;
};



// Sample data for the charts (keep existing data for now)
const lineChartData = [
  { name: 'Jan', thisYear: 10000, lastYear: 12000 },
  { name: 'Feb', thisYear: 9000, lastYear: 11000 },
  { name: 'Mar', thisYear: 15000, lastYear: 16000 },
  { name: 'Apr', thisYear: 20000, lastYear: 18000 },
  { name: 'May', thisYear: 17000, lastYear: 14000 },
  { name: 'Jun', thisYear: 22000, lastYear: 21000 },
  { name: 'Jul', thisYear: 25000, lastYear: 23000 },
];

const barChartData = [
  { day: 'Mon', date: '11/6', score: 7 },
  { day: 'Tues', date: '11/7', score: 8 },
  { day: 'Wed', date: '11/8', score: 6 },
  { day: 'Thurs', date: '11/9', score: 10 },
  { day: 'Fri', date: '11/10', score: 5 },
  { day: 'Sat', date: '11/11', score: 7 },
  { day: 'Sun', date: '11/12', score: 7 },
];

const pieChartData = [
  { name: 'Debris', value: 38.6, color: '#8884d8' },
  { name: 'Satellites', value: 22.5, color: '#82ca9d' },
  { name: 'NEOs', value: 30.8, color: '#36a2eb' },
  { name: 'Other', value: 8.1, color: '#ffc658' },
];


const DashboardModule: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [neoData, setNeoData] = useState<NEOData[]>([]);
  const [approachData, setApproachData] = useState<ApproachData[]>([]);
  const [neoLoading, setNeoLoading] = useState(true);
  const previousDataRef = useRef<DashboardData | null>(null);
  const [lineChartData, setLineChartData] = useState<Array<{ name: string; thisYear: number; lastYear: number }>>([]);
  const [satellitesByOwnerData, setSatellitesByOwnerData] = useState<Array<{ country: string; active_payload_count: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [impactsByType, setImpactsByType] = useState({
    solarFlares: [] as string[],
    cmes: [] as string[],
    geostorms: [] as string[],
  });
  const [collapse, setCollapse] = useState({
    solarFlares: false,
    cmes: false,
    geostorms: false,
  });

  const [environmentalRiskData, setEnvironmentalRiskData] = useState<Array<{
    region: string;
    risk_score: number;
  }>>([]);

  // Dynamically get the current and last year
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  useEffect(() => {
    const currentDate = new Date();
    setLastUpdated(currentDate.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }));
  }, []);

  useEffect(() => {
    const fetchEnvironmentalRiskData = async () => {
      try {
        const response = await fetch('/api/environmental-scores');
        if (!response.ok) throw new Error('Failed to fetch environmental risk data');
        
        const data = await response.json();
        
        // Process the data to get the most recent score for each region
        const latestScoresByRegion = new Map<string, number>();
        
        data.forEach((score: any) => {
          const region = score.region;
          const currentTimestamp = new Date(score.timestamp).getTime();
          const existingScore = latestScoresByRegion.get(region);
          
          if (!existingScore || currentTimestamp > new Date(existingScore).getTime()) {
            latestScoresByRegion.set(region, score.risk_score);
          }
        });
  
        // Convert the Map to an array and sort by region
        const processedData = Array.from(latestScoresByRegion.entries())
          .map(([region, risk_score]) => ({ region, risk_score }))
          .sort((a, b) => a.region.localeCompare(b.region));
  
        setEnvironmentalRiskData(processedData);
      } catch (error) {
        console.error('Error fetching environmental risk data:', error);
      }
    };
  
    fetchEnvironmentalRiskData();
    const interval = setInterval(fetchEnvironmentalRiskData, 300000); // Update every 5 minutes
  
    return () => clearInterval(interval);
  }, []);

  // Fetch space weather data
  // First, update the useEffect for fetching space weather data
useEffect(() => {
  async function fetchSpaceWeatherData() {
    try {
      // Get the last month's date range
      const now = new Date();
      const endDate = now.toISOString().split('T')[0];
      const startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];

      const [solarFlareResponse, cmeResponse, geostormResponse] = await Promise.all([
        fetch(`/api/spaceweather?type=solar_flare&start=${startDate}&end=${endDate}`),
        fetch(`/api/spaceweather?type=cme&start=${startDate}&end=${endDate}`),
        fetch(`/api/spaceweather?type=geostorm&start=${startDate}&end=${endDate}`)
      ]);

      if (!solarFlareResponse.ok || !cmeResponse.ok || !geostormResponse.ok) {
        throw new Error('Failed to fetch space weather data');
      }

      const solarFlareData = await solarFlareResponse.json();
      const cmeData = await cmeResponse.json();
      const geostormData = await geostormResponse.json();

      const solarFlares: string[] = [];
      const cmes: string[] = [];
      const geostorms: string[] = [];

      // Process Solar Flare Data
      solarFlareData.forEach((flare: any) => {
        if (flare.class_type.startsWith('X')) {
          solarFlares.push(
            `⚡ High-intensity solar flare detected (Class: ${flare.class_type}) on ${new Date(flare.peak_time).toLocaleString()}`
          );
        } else if (flare.class_type.startsWith('M')) {
          solarFlares.push(
            `📡 Moderate solar flare detected (Class: ${flare.class_type}) on ${new Date(flare.peak_time).toLocaleString()}`
          );
        }
      });

      // Process CME Data
      cmeData.forEach((cme: any) => {
        if (cme.speed > 750) {
          cmes.push(
            `💨 High-speed CME detected (Speed: ${cme.speed} km/s) on ${new Date(cme.start_time).toLocaleString()}`
          );
        }
      });

      // Process Geostorm Data
      geostormData.forEach((storm: any) => {
        if (storm.kp_index >= 7) {
          geostorms.push(
            `🌌 Severe geomagnetic storm detected (KP Index: ${storm.kp_index}) on ${new Date(storm.observed_time).toLocaleString()}`
          );
        } else if (storm.kp_index >= 5) {
          geostorms.push(
            `🌍 Moderate geomagnetic storm detected (KP Index: ${storm.kp_index}) on ${new Date(storm.observed_time).toLocaleString()}`
          );
        }
      });

      setImpactsByType({ solarFlares, cmes, geostorms });
    } catch (error) {
      console.error('Error fetching space weather data:', error);
    }
  }

  fetchSpaceWeatherData();
  // Set up auto-refresh every 5 minutes
  const interval = setInterval(fetchSpaceWeatherData, 300000);
  return () => clearInterval(interval);
}, []);

  
  useEffect(() => {
    const fetchNEOData = async () => {
      setNeoLoading(true);
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [neoResponse, approachResponse] = await Promise.all([
          fetch(`/api/neo?start=${startDate}&end=${endDate}`),
          fetch(`/api/neo/approaches?start=${startDate}&end=${endDate}`)
        ]);

        if (!neoResponse.ok || !approachResponse.ok) {
          throw new Error('Failed to fetch NEO data');
        }

        const neoResult = await neoResponse.json();
        const approachResult = await approachResponse.json();

        setNeoData(neoResult);
        setApproachData(approachResult);
      } catch (error) {
        console.error('Error fetching NEO data:', error);
      } finally {
        setNeoLoading(false);
      }
    };

    fetchNEOData();
    const interval = setInterval(fetchNEOData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchDashboardData = async () => {
        try {
          const response = await fetch('/api/dashboard');
          if (!response.ok) throw new Error('Failed to fetch data');
      
          const result = await response.json();
          if (!result.success) throw new Error(result.message);
      
          // Store the fetched data
          const currentData = result.data;
      
          // Calculate percentage changes for tracked stats
          if (previousDataRef.current) {
            currentData.trackedDebris.percentageChange = calculateSlightPercentageChange(
              currentData.trackedDebris.count,
              previousDataRef.current.trackedDebris.count
            );
            currentData.activeSatellites.percentageChange = calculateSlightPercentageChange(
              currentData.activeSatellites.count,
              previousDataRef.current.activeSatellites.count
            );
            currentData.rocketBodies.percentageChange = calculateSlightPercentageChange(
              currentData.rocketBodies.count,
              previousDataRef.current.rocketBodies.count
            );
            currentData.totalTracked.percentageChange = calculateSlightPercentageChange(
              currentData.totalTracked.count,
              previousDataRef.current.totalTracked.count
            );
          }
      
          // Update the `previousDataRef` with the current data
          previousDataRef.current = currentData;
      
          // Update the state with the current data
          setData(currentData);
      
          // Transform `yearComparison` data for the chart
          const transformedLineChartData = result.data.yearComparison.map((item: any) => {
            const date = new Date(`${item.month} 1, ${currentYear}`);
            return {
              name: date.toLocaleString('en-US', { month: 'short' }),
              thisYear: item.current_year_count,
              lastYear: item.prior_year_count,
            };
          });
          setLineChartData(transformedLineChartData);
      
          // Set `topCountries` data for the "Satellites by Owner" chart
          setSatellitesByOwnerData(result.data.topCountries);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          console.error('Error fetching dashboard data:', err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchDashboardData();
  
      // Set up polling for real-time updates
      const interval = setInterval(fetchDashboardData, 300000); // every 5 minutes
  
      return () => clearInterval(interval);
    }
  }, []);

  // Calculate NEO stats
  const totalNEOs = neoData.length;
  const hazardousCount = neoData.filter(neo => neo.is_potentially_hazardous).length;
  const averageDiameter = neoData.length > 0 
    ? neoData.reduce((acc, neo) => acc + neo.estimated_diameter_km, 0) / neoData.length 
    : 0;
  const closestApproach = approachData.length > 0
    ? Math.min(...approachData.map(a => a.miss_distance_km))
    : 0;



  return (
    <>
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
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

      <div className="p-6 space-y-6 overflow-auto relative">
        <div className="flex justify-between items-center mb-6">
          <div className="text-3xl font-bold text-white">
            Overview Dashboard
          </div>

          <div className="text-base text-gray-300">
            {lastUpdated ? `Last Updated: ${lastUpdated}` : 'Loading...'}
          </div>
        </div>
        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div
            className="p-4 rounded shadow"
            style={{
              backgroundColor:
                data?.trackedDebris?.percentageChange === 0
                  ? '#ccf6e9'
                  : (data?.trackedDebris?.percentageChange ?? 0) > 0
                  ? '#ccf6e9'
                  : '#f9b3b1',
            }}
          >
            <h3 className="text-lg font-semibold" style={{ color: 'black' }}>Tracked Debris</h3>
            <p className="text-3xl font-bold" style={{ color: 'black' }}>
              {loading ? '...' : (data?.trackedDebris?.count ?? 0).toLocaleString()}
            </p>
            <p
              className={`text-sm ${
                data?.trackedDebris?.percentageChange === 0
                  ? 'text-green-600'
                  : (data?.trackedDebris?.percentageChange ?? 0) > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {loading
                ? '...'
                : `${data?.trackedDebris?.percentageChange?.toFixed(2) ?? '0.00'}% ${
                    (data?.trackedDebris?.percentageChange ?? 0) >= 0 ? '▲' : '▼'
                  }`}
            </p>
          </div>

          <div
            className="p-4 rounded shadow"
            style={{
              backgroundColor:
                data?.activeSatellites?.percentageChange === 0
                  ? '#ccf6e9'
                  : (data?.activeSatellites?.percentageChange ?? 0) > 0
                  ? '#ccf6e9'
                  : '#f9b3b1',
            }}
          >
            <h3 className="text-lg font-semibold" style={{ color: 'black' }}>Active Satellites</h3>
            <p className="text-3xl font-bold" style={{ color: 'black' }}>
              {loading ? '...' : (data?.activeSatellites?.count ?? 0).toLocaleString()}
            </p>
            <p
              className={`text-sm ${
                data?.activeSatellites?.percentageChange === 0
                  ? 'text-green-600'
                  : (data?.activeSatellites?.percentageChange ?? 0) > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {loading
                ? '...'
                : `${data?.activeSatellites?.percentageChange?.toFixed(2) ?? '0.00'}% ${
                    (data?.activeSatellites?.percentageChange ?? 0) >= 0 ? '▲' : '▼'
                  }`}
            </p>
          </div>

          <div
            className="p-4 rounded shadow"
            style={{
              backgroundColor:
                data?.rocketBodies?.percentageChange === 0
                  ? '#ccf6e9'
                  : (data?.rocketBodies?.percentageChange ?? 0) > 0
                  ? '#ccf6e9'
                  : '#f9b3b1',
            }}
          >
            <h3 className="text-lg font-semibold" style={{ color: 'black' }}>Rocket Bodies</h3>
            <p className="text-3xl font-bold" style={{ color: 'black' }}>
              {loading ? '...' : (data?.rocketBodies?.count ?? 0).toLocaleString()}
            </p>
            <p
              className={`text-sm ${
                data?.rocketBodies?.percentageChange === 0
                  ? 'text-green-600'
                  : (data?.rocketBodies?.percentageChange ?? 0) > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {loading
                ? '...'
                : `${data?.rocketBodies?.percentageChange?.toFixed(2) ?? '0.00'}% ${
                    (data?.rocketBodies?.percentageChange ?? 0) >= 0 ? '▲' : '▼'
                  }`}
            </p>
          </div>

          <div
            className="p-4 rounded shadow"
            style={{
              backgroundColor:
                data?.totalTracked?.percentageChange === 0
                  ? '#ccf6e9'
                  : (data?.totalTracked?.percentageChange ?? 0) > 0
                  ? '#ccf6e9'
                  : '#f9b3b1',
            }}
          >
            <h3 className="text-lg font-semibold" style={{ color: 'black' }}>Total Tracked Objects</h3>
            <p className="text-3xl font-bold" style={{ color: 'black' }}>
              {loading ? '...' : (data?.totalTracked?.count ?? 0).toLocaleString()}
            </p>
            <p
              className={`text-sm ${
                data?.totalTracked?.percentageChange === 0
                  ? 'text-green-600'
                  : (data?.totalTracked?.percentageChange ?? 0) > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {loading
                ? '...'
                : `${data?.totalTracked?.percentageChange?.toFixed(2) ?? '0.00'}% ${
                    (data?.totalTracked?.percentageChange ?? 0) >= 0 ? '▲' : '▼'
                  }`}
            </p>
          </div>
        </div>
        {/* Charts */}
        <div className="grid grid-cols-3 gap-6">
          {/* Total Objects Chart */}
          <div className="col-span-2 bg-[#1f1f24] p-6 rounded shadow">
            <h3 className="text-xl font-bold text-white">Total Launches</h3>
            <p className="text-sm text-gray-400">
              {`${currentYear} vs. ${lastYear}`}
            </p>
            <div
              className="mt-4 bg-gray-700 rounded-lg flex items-center justify-center"
              style={{ height: '300px' }}
            >
              <ResponsiveContainer width="95%" height={250}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#c0c0df" 
                    tickFormatter={(month) => month} 
                  />
                  <YAxis stroke="#c0c0df"
                  label={{ 
                    value: 'Launch Count', 
                    angle: -90, 
                    position: 'insideLeft', 
                    fill: '#c0c0df',
                    style: { textAnchor: 'middle' },
                    offset: 1
                  }}  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f1f24',
                      borderColor: '#36a2eb',
                      borderRadius: '8px',
                      color: '#ffffff',
                    }}
                    itemStyle={{
                      color: '#ffffff',
                    }}
                    
                  />
                  <Legend
                    formatter={(value) =>
                      value === 'thisYear'
                        ? `${currentYear}`
                        : `${lastYear}`
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="thisYear"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="lastYear" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Space Weather Impacts Section */}
          <div className="bg-[#1f1f24] p-6 rounded shadow">
            <h3 className="text-xl font-bold text-white mb-4">Space Weather Impacts</h3>
            <div className="bg-gray-700 rounded-lg p-4">
              {/* Solar Flares Section */}
              <div className="mb-4">
                <div
                  className="cursor-pointer text-md font-semibold mb-2 text-gray-300 flex justify-between items-center"
                  onClick={() => setCollapse(prev => ({ ...prev, solarFlares: !prev.solarFlares }))}
                >
                  <div className="flex items-center gap-2">
                    <GiSunRadiations className="text-white-800" />
                    <span>Solar Flares</span>
                  </div>
                  <span>{collapse.solarFlares ? '▼' : '►'}</span>
                </div>
                {!collapse.solarFlares && (
                  <ul className="list-disc list-inside space-y-2">
                    {impactsByType.solarFlares.slice(0, 2).map((impact, index) => (
                      <li key={`solar-${index}`} className="text-sm text-gray-300">{impact}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* CMEs Section */}
              <div className="mb-4">
                <div
                  className="cursor-pointer text-md font-semibold mb-2 text-gray-300 flex justify-between items-center"
                  onClick={() => setCollapse(prev => ({ ...prev, cmes: !prev.cmes }))}
                >
                  <div className="flex items-center gap-2">
                    <FiSunrise className="text-white-800" />
                    <span>Coronal Mass Ejections</span>
                  </div>
                  <span>{collapse.cmes ? '▼' : '►'}</span>
                </div>
                {!collapse.cmes && (
                  <ul className="list-disc list-inside space-y-2">
                    {impactsByType.cmes.slice(0, 2).map((impact, index) => (
                      <li key={`cme-${index}`} className="text-sm text-gray-300">{impact}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Geomagnetic Storms Section */}
              <div>
                <div
                  className="cursor-pointer text-md font-semibold mb-2 text-gray-300 flex justify-between items-center"
                  onClick={() => setCollapse(prev => ({ ...prev, geostorms: !prev.geostorms }))}
                >
                  <div className="flex items-center gap-2">
                    <TbSunElectricity className="text-white-800" />
                    <span>Geomagnetic Storms</span>
                  </div>
                  <span>{collapse.geostorms ? '▼' : '►'}</span>
                </div>
                {!collapse.geostorms && (
                  <ul className="list-disc list-inside space-y-2">
                    {impactsByType.geostorms.slice(0, 2).map((impact, index) => (
                      <li key={`storm-${index}`} className="text-sm text-gray-300">{impact}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Environmental Risk by Region */}
          <div className="bg-[#1f1f24] p-6 rounded shadow">
            <h3 className="text-xl font-bold text-white">Environmental Risk by Region</h3>
            <div className="mt-4 bg-gray-700 rounded-lg flex items-center justify-center" style={{ height: '300px' }}>
              <ResponsiveContainer width="95%" height={250}>
                <BarChart data={environmentalRiskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="region" 
                    stroke="#c0c0df"
                    tick={{ fill: '#c0c0df' }}
                    label={{ 
                      value: 'Regions', 
                      angle: 0, 
                      position: 'insideBottom', 
                      fill: '#c0c0df',
                      style: { textAnchor: 'middle' },
                      offset: -5
                    }} 
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    stroke="#c0c0df"
                    tick={{ fill: '#c0c0df' }}
                    label={{ 
                      value: 'Environmental Score (0.0-10.0)', 
                      angle: -90, 
                      position: 'insideLeft', 
                      fill: '#c0c0df',
                      style: { textAnchor: 'middle' },
                      offset: 1
                    }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f1f24',
                      borderColor: '#36a2eb',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    itemStyle={{
                      color: '#ffffff'
                    }}
                    formatter={(value: any) => {
                      if (typeof value === 'number') {
                        return value.toFixed(2);
                      }
                      return value;
                    }}
                    labelFormatter={(region) => `Region ${region}`}
                  />
                  <Bar 
                    dataKey="risk_score" 
                    fill="#36a2eb" 
                    radius={[10, 10, 0, 0]}
                    name="Risk Score"
                  >
                    {environmentalRiskData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.risk_score >= 7 ? '#ef4444' : 
                              entry.risk_score >= 4 ? '#f59e0b' : 
                              '#22c55e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Satellites by Country Chart */}
          <div className="bg-[#1f1f24] p-6 rounded shadow">
            <h3 className="text-xl font-bold text-white">Satellites by Country</h3>
            <div
              className="mt-4 bg-gray-700 rounded-lg flex items-center justify-center"
              style={{ height: '300px' }}
            >
              {loading ? (
                <p className="text-white">Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <ResponsiveContainer width="95%" height={250}>
                  <BarChart data={satellitesByOwnerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="country" stroke="#c0c0df"
                    label={{ 
                        value: 'Country', 
                        angle: 0, 
                        position: 'insideBottom', 
                        fill: '#c0c0df',
                        style: { textAnchor: 'middle' },
                        offset: -5
                      }} />
                    <YAxis
                      stroke="#c0c0df"
                      scale="log"
                      domain={[1, 'auto']}
                      allowDataOverflow={true}
                      tickFormatter={(value) => value.toLocaleString()}
                      label={{ 
                        value: 'Satellite Count', 
                        angle: -90, 
                        position: 'insideLeft', 
                        fill: '#c0c0df',
                        style: { textAnchor: 'middle' },
                        offset: 0  
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f1f24',
                        borderColor: '#36a2eb',
                        borderRadius: '8px',
                        color: '#ffffff',
                      }}
                      itemStyle={{
                        color: '#ffffff',
                      }}
                      formatter={(value: number) => value.toLocaleString()}
                    />
                    <Bar
                      dataKey="active_payload_count"
                      fill="#36a2eb"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
           {/* NEO Stats - New Section */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-white mb-4">Near Earth Objects Overview (Past 7 Days)</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#1f1f24] p-4 rounded shadow">
              <h3 className="text-lg font-semibold text-gray-300">Total NEOs</h3>
              <p className="text-3xl font-bold text-white">
                {neoLoading ? '...' : totalNEOs}
              </p>
            </div>

            <div className="bg-[#1f1f24] p-4 rounded shadow">
              <h3 className="text-lg font-semibold text-gray-300">Potentially Hazardous</h3>
              <div className="flex items-center">
                <p className="text-3xl font-bold" style={{ color: hazardousCount > 0 ? '#f97316' : 'white' }}>
                  {neoLoading ? '...' : hazardousCount}
                </p>
                {hazardousCount > 0 && <AlertTriangle className="ml-2 text-orange-500" />}
              </div>
            </div>

            <div className="bg-[#1f1f24] p-4 rounded shadow">
              <h3 className="text-lg font-semibold text-gray-300">Average Diameter</h3>
              <p className="text-3xl font-bold text-white">
                {neoLoading ? '...' : (averageDiameter).toFixed(2)}
                <span className="text-sm text-gray-400 ml-1">km</span>
              </p>
            </div>

            <div className="bg-[#1f1f24] p-4 rounded shadow">
              <h3 className="text-lg font-semibold text-gray-300">Closest Approach</h3>
              <p className="text-3xl font-bold text-white">
                {neoLoading ? '...' : new Intl.NumberFormat('en-US', { 
                  maximumFractionDigits: 2 
                }).format(closestApproach)}
                <span className="text-sm text-gray-400 ml-1">km</span>
              </p>
            </div>
          </div>
        

        {/* NEO Approaches Chart - New Section */}
        <div className="bg-[#1f1f24] p-6 rounded shadow mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">NEO Approaches (Past 7 Days)</h3>
            {neoLoading && <p className="text-sm text-gray-400">Loading...</p>}
          </div>
          <div className="mt-4 bg-gray-700 rounded-lg flex items-center justify-center" style={{ height: '300px' }}>
            {neoLoading ? (
              <p className="text-white">Loading data...</p>
            ) : approachData.length === 0 ? (
              <p className="text-gray-400">No approach data available</p>
            ) : (
              <ResponsiveContainer width="95%" height={250}>
                <LineChart data={approachData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.5} />
                  <XAxis 
                    dataKey="close_approach_date" 
                    stroke="#c0c0df"
                    tick={{ fill: '#c0c0df' }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    label={{ 
                      value: 'Date', 
                      angle: 0, 
                      position: 'insideBottom', 
                      fill: '#c0c0df',
                      style: { textAnchor: 'middle' },
                      offset: -5  
                    }}
                    interval="preserveStartEnd"
                    minTickGap={200}
                  />
                  <YAxis 
                    stroke="#c0c0df"
                    tick={{ fill: '#c0c0df' }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    label={{ 
                      value: 'Distance (millions km)', 
                      angle: -90, 
                      position: 'insideLeft', 
                      fill: '#c0c0df',
                      style: { textAnchor: 'middle' },
                      offset: 0  
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f1f24',
                      borderColor: '#36a2eb',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: any) => [
                      `${(value / 1000000).toFixed(2)}M km`,
                      "Miss Distance"
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="miss_distance_km" 
                    stroke="#36a2eb" 
                    strokeWidth={1.5}
                    name="Miss Distance"
                    dot={false}
                    activeDot={{ r: 4, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {approachData.length > 0 && (
            <div className="mt-4 text-sm text-gray-400">
              <p>
                Closest approach: {(closestApproach / 1000000).toFixed(2)}M km on {
                  new Date(approachData.find(a => a.miss_distance_km === closestApproach)?.close_approach_date || '')
                    .toLocaleDateString()
                }
              </p>
            </div>
          )}
        </div>
        </div>

        {/* Closing tags for the wrapper divs */}
      </div>
    </>
  );
};

export default DashboardModule;
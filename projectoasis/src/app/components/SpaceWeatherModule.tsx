import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { GiSunRadiations } from "react-icons/gi";
import { FiSunrise } from "react-icons/fi";
import { TbSunElectricity } from "react-icons/tb";

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend
);

// Type definitions
interface SolarFlare {
  class_type: string;
  peak_time: string;
}

interface CME {
  speed: number;
  start_time: string;
}

interface Geostorm {
  kp_index: number;
  observed_time: string;
}

interface ImpactsByType {
  solarFlares: string[];
  cmes: string[];
  geostorms: string[];
}

interface SolarFlareStats {
  strongestFlare: string;
  classDistribution: {
    X: number;
    M: number;
    C: number;
  };
}

export default function SpaceWeatherModule() {
  // State management with proper typing
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [solarFlareData, setSolarFlareData] = useState<SolarFlare[]>([]);
  const [cmeData, setCmeData] = useState<CME[]>([]);
  const [geostormData, setGeostormData] = useState<Geostorm[]>([]);
  const [impactsByType, setImpactsByType] = useState<ImpactsByType>({
    solarFlares: [],
    cmes: [],
    geostorms: [],
  });
  const [solarFlareStats, setSolarFlareStats] = useState<SolarFlareStats>({
    strongestFlare: '',
    classDistribution: { X: 0, M: 0, C: 0 },
  });
  const [fastestCME, setFastestCME] = useState<string>('');
  const [collapse, setCollapse] = useState({
    solarFlares: false,
    cmes: false,
    geostorms: false,
  });

// Helper function to get date range for the last month
const getLastMonthDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1); // Go back one month
  
  // Format dates as YYYY-MM-DD
  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

// Fetch data function with error handling
async function fetchData(
  eventType: string, 
  setData: Function
) {
  try {
    const dateRange = getLastMonthDateRange();
    let query = '';

    // Different date ranges for different event types
    if (eventType === 'geostorm') {
      query = `type=${eventType}&start=2010-01-01&end=${dateRange.end}`;
    } else {
      // For solar_flare and cme, use last month's range
      query = `type=${eventType}&start=${dateRange.start}&end=${dateRange.end}`;
    }
    
    const response = await fetch(`/api/spaceweather?${query}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error(`Error fetching ${eventType} data:`, error);
    setError(error instanceof Error ? error.message : 'An error occurred');
  }
}

// Initial data fetch
useEffect(() => {
  setLoading(true);
  
  Promise.all([
    fetchData('solar_flare', setSolarFlareData),
    fetchData('cme', setCmeData),
    fetchData('geostorm', setGeostormData)
  ]).finally(() => {
    setLoading(false);
  });

  // Set up an interval to refresh data every 5 minutes
  const intervalId = setInterval(() => {
    Promise.all([
      fetchData('solar_flare', setSolarFlareData),
      fetchData('cme', setCmeData),
      fetchData('geostorm', setGeostormData)
    ]);
  }, 300000); // 5 minutes in milliseconds

  // Cleanup interval on component unmount
  return () => clearInterval(intervalId);
}, []);

// Calculate stats and insights
useEffect(() => {
  if (loading) return;

  const now = new Date();
  // Get the first day of the previous month
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  const solarFlares: string[] = [];
  const cmes: string[] = [];
  const geostorms: string[] = [];

  let strongestFlare = '';
  const classDistribution = { X: 0, M: 0, C: 0 };

  try {
    // Process Solar Flare Data
    solarFlareData.forEach((flare: SolarFlare) => {
      const flareDate = new Date(flare.peak_time);
      // Check if the flare occurred in the last month
      if (flareDate >= lastMonth) {
        if (flare.class_type.startsWith('X')) {
          classDistribution.X += 1;
          solarFlares.push(
            `⚡ High-intensity solar flare detected (Class: ${flare.class_type}) on ${new Date(flare.peak_time).toLocaleString()}. Possible radio blackouts and satellite communication disruptions.`
          );
        } else if (flare.class_type.startsWith('M')) {
          classDistribution.M += 1;
          solarFlares.push(
            `📡 Moderate solar flare detected (Class: ${flare.class_type}) on ${new Date(flare.peak_time).toLocaleString()}. Minor impacts on HF communication.`
          );
        } else if (flare.class_type.startsWith('C')) {
          classDistribution.C += 1;
        }

        if (!strongestFlare || flare.class_type > strongestFlare) {
          strongestFlare = `${flare.class_type} on ${new Date(flare.peak_time).toLocaleString()}`;
        }
      }
    });

    // Process CME Data
    let fastestCMESpeed = 0;
    let fastestCMEEvent = '';

    cmeData.forEach((cme: CME) => {
      const cmeDate = new Date(cme.start_time);
      // Check if the CME occurred in the last month
      if (cmeDate >= lastMonth) {
        if (cme.speed > 750) {
          cmes.push(
            `💨 High-speed CME detected (Speed: ${cme.speed} km/s) on ${new Date(cme.start_time).toLocaleString()}. Potential for geomagnetic storms and power grid impacts.`
          );
        }
        if (cme.speed > fastestCMESpeed) {
          fastestCMESpeed = cme.speed;
          fastestCMEEvent = `${cme.speed} km/s on ${new Date(cme.start_time).toLocaleString()}`;
        }
      }
    });

    // Process Geostorm Data
    geostormData.forEach((storm: Geostorm) => {
      const stormDate = new Date(storm.observed_time);
      // Check if the storm occurred in the last month
      if (stormDate >= lastMonth) {
        if (storm.kp_index >= 7) {
          geostorms.push(
            `🌌 Severe geomagnetic storm detected (KP Index: ${storm.kp_index}) on ${new Date(storm.observed_time).toLocaleString()}. Possible power grid failures and widespread aurora visibility.`
          );
        } else if (storm.kp_index >= 5) {
          geostorms.push(
            `🌍 Moderate geomagnetic storm detected (KP Index: ${storm.kp_index}) on ${new Date(storm.observed_time).toLocaleString()}. Some satellite orientation issues and aurora activity expected.`
          );
        }
      }
    });

    setImpactsByType({ solarFlares, cmes, geostorms });
    setSolarFlareStats({ strongestFlare, classDistribution });
    setFastestCME(fastestCMEEvent);
  } catch (error) {
    console.error('Error processing space weather data:', error);
    setError(error instanceof Error ? error.message : 'Error processing data');
  }
}, [solarFlareData, cmeData, geostormData, loading]);

const toggleCollapse = (type: string) => {
  setCollapse((prev) => ({ ...prev, [type]: !prev[type] }));
};

return (
  <div className="p-6 text-white">
    <h1 className="text-3xl font-bold mb-6">Space Weather</h1>
    <p className="mb-8">This module provides information and analysis on space weather phenomena such as solar flares and geomagnetic storms.</p>

    {error && (
      <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
        Error: {error}
      </div>
    )}

    {loading ? (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-400">Loading space weather data...</div>
      </div>
    ) : (
      <>
        {/* Weather Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Solar Flare Activity */}
          <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-4">Solar Flare Activity</h2>
            <Line
              data={{
                labels: solarFlareData.map((item) => new Date(item.peak_time).toLocaleString()),
                datasets: [
                  {
                    label: 'Solar Flare Intensity',
                    data: solarFlareData.map((item) => parseFloat(item.class_type.replace(/[A-Za-z]/g, ''))),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  },
                  y: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  }
                },
                plugins: {
                  legend: {
                    labels: { color: '#ffffff' }
                  }
                }
              }}
            />
          </div>

          {/* Coronal Mass Ejections */}
          <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-4">Coronal Mass Ejections</h2>
            <Bar
              data={{
                labels: cmeData.map((item) => new Date(item.start_time).toLocaleString()),
                datasets: [
                  {
                    label: 'CME Speed (km/s)',
                    data: cmeData.map((item) => item.speed),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  },
                  y: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  }
                },
                plugins: {
                  legend: {
                    labels: { color: '#ffffff' }
                  }
                }
              }}
            />
          </div>

          {/* Geomagnetic Storms */}
          <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-4">Geomagnetic Storms (2010 - Present)</h2>
            <Bar
              data={{
                labels: geostormData.map((item) => new Date(item.observed_time).toLocaleString()),
                datasets: [
                  {
                    label: 'KP Index',
                    data: geostormData.map((item) => item.kp_index),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  },
                ],
              }}
              options={{
                responsive: true,
                scales: {
                  x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  },
                  y: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                  }
                },
                plugins: {
                  legend: {
                    labels: { color: '#ffffff' }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Solar Flare Distribution and Impacts */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Solar Flare Distribution Box */}
          <div className="bg-[#2c2c2c] p-8 rounded-lg shadow-md h-[38rem]">
            <h3 className="text-lg font-bold mb-6">Solar Flare Class Distribution</h3>
            <div className="w-[99%] h-[99%] flex justify-center items-center">
              <Pie
                data={{
                  labels: ['X-Class', 'M-Class', 'C-Class'],
                  datasets: [
                    {
                      label: 'Solar Flare Distribution',
                      data: [
                        solarFlareStats.classDistribution.X,
                        solarFlareStats.classDistribution.M,
                        solarFlareStats.classDistribution.C,
                      ],
                      backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        color: '#ffffff',
                        boxWidth: 20,
                        padding: 10,
                      },
                    },
                  },
                  maintainAspectRatio: true,
                  responsive: true,
                }}
              />
            </div>
          </div>

          {/* Weather Impacts Box */}
          <div className="bg-[#2c2c2c] p-8 rounded-lg shadow-md h-[38rem] overflow-y-auto">
            <h3 className="text-lg font-bold mb-6">Latest Space Weather Impacts</h3>

            {/* Solar Flares Section */}
            <div className="mb-4">
              <div
                className="cursor-pointer text-md font-semibold mb-2 text-gray-300 flex justify-between items-center"
                onClick={() => toggleCollapse('solarFlares')}
              >
                <div className="flex items-center gap-2">
                  <GiSunRadiations className="text-yellow-500" />
                  <span>Solar Flares</span>
                </div>
                <span>{collapse.solarFlares ? '▼' : '►'}</span>
              </div>
              {!collapse.solarFlares && (
                <ul className="list-disc list-inside space-y-2">
                  {impactsByType.solarFlares.length > 0 ? (
                    impactsByType.solarFlares.slice(0, 5).map((impact, index) => (
                      <li key={`solar-${index}`} className="text-sm">{impact}</li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-400">No significant solar flare activity detected</li>
                  )}
                </ul>
              )}
            </div>

            {/* CMEs Section */}
            <div className="mb-4">
              <div
                className="cursor-pointer text-md font-semibold mb-2 text-gray-300 flex justify-between items-center"
                onClick={() => toggleCollapse('cmes')}
              >
                <div className="flex items-center gap-2">
                  <FiSunrise className="text-orange-500" />
                  <span>Coronal Mass Ejections</span>
                </div>
                <span>{collapse.cmes ? '▼' : '►'}</span>
              </div>
              {!collapse.cmes && (
                <ul className="list-disc list-inside space-y-2">
                  {impactsByType.cmes.length > 0 ? (
                    impactsByType.cmes.slice(0, 5).map((impact, index) => (
                      <li key={`cme-${index}`} className="text-sm">{impact}</li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-400">No significant CME activity detected</li>
                  )}
                </ul>
              )}
            </div>

            {/* Geomagnetic Storms Section */}
            <div>
              <div
                className="cursor-pointer text-md font-semibold mb-2 text-gray-300 flex justify-between items-center"
                onClick={() => toggleCollapse('geostorms')}
              >
                <div className="flex items-center gap-2">
                  <TbSunElectricity className="text-blue-500" />
                  <span>Geomagnetic Storms</span>
                </div>
                <span>{collapse.geostorms ? '▼' : '►'}</span>
              </div>
              {!collapse.geostorms && (
                <ul className="list-disc list-inside space-y-2">
                  {impactsByType.geostorms.length > 0 ? (
                    impactsByType.geostorms.slice(0, 5).map((impact, index) => (
                      <li key={`storm-${index}`} className="text-sm">{impact}</li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-400">No geomagnetic storm activity detected</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);
}
'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

const activeWeatherEventsData = [
  { type: 'Solar Storms', status: 'Active', color: '#36a2eb' },
  { type: 'Geomagnetic Activity', status: 'High', color: '#ffc658' },
  { type: 'Radiation Bursts', status: 'Moderate', color: '#82ca9d' },
  { type: 'Solar Wind Speed', status: 'Increased', color: '#8884d8' },
  { type: 'Cosmic Ray Levels', status: 'Low', color: '#c0c0df' },
  { type: 'Particle Storms', status: 'Severe', color: '#f94a4a' },
];

const DashboardModule: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [lineChartData, setLineChartData] = useState<Array<{ name: string; thisYear: number; lastYear: number }>>([]);
  const [satellitesByOwnerData, setSatellitesByOwnerData] = useState<Array<{ country: string; active_payload_count: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current timestamp
  const currentDate = new Date();
  const lastUpdated = currentDate.toLocaleString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const result = await response.json();
        if (!result.success) throw new Error(result.message);
        
        setData(result.data);

        // Transform `yearComparison` data for the chart
        const transformedLineChartData = result.data.yearComparison.map((item: any) => ({
          name: item.month,
          thisYear: item.current_year_count,
          lastYear: item.prior_year_count,
        }));
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
  }, []);

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
            Last Updated: {lastUpdated}
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#ccf6e9] text-black p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Tracked Debris</h3>
            <p className="text-3xl font-bold">
              {loading 
                ? '...' 
                : (data?.trackedDebris?.count ?? 0).toLocaleString()}
            </p>
            <p className={`text-sm ${
              (data?.trackedDebris?.percentageChange ?? 0) >= 0 
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
          <div className="bg-[#f9b3b1] text-black p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Active Satellites</h3>
            <p className="text-3xl font-bold">
              {loading 
                ? '...' 
                : (data?.activeSatellites?.count ?? 0).toLocaleString()}
            </p>
            <p className={`text-sm ${
              (data?.activeSatellites?.percentageChange ?? 0) >= 0 
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
          <div className="bg-[#ccf6e9] text-black p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Rocket Bodies</h3>
            <p className="text-3xl font-bold">
              {loading 
                ? '...' 
                : (data?.rocketBodies?.count ?? 0).toLocaleString()}
            </p>
            <p className={`text-sm ${
              (data?.rocketBodies?.percentageChange ?? 0) >= 0 
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
          <div className="bg-[#ccf6e9] text-black p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Total Tracked Objects</h3>
            <p className="text-3xl font-bold">
              {loading 
                ? '...' 
                : (data?.totalTracked?.count ?? 0).toLocaleString()}
            </p>
            <p className={`text-sm ${
              (data?.totalTracked?.percentageChange ?? 0) >= 0 
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
            <h3 className="text-xl font-bold text-white">Total Objects</h3>
            <p className="text-sm text-gray-400">This year vs. Last year</p>
            <div className="mt-4 bg-gray-700 rounded-lg flex items-center justify-center" style={{ height: '300px' }}>
              <ResponsiveContainer width="95%" height={250}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#c0c0df" />
                  <YAxis stroke="#c0c0df" />
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
                  <Legend />
                  <Line type="monotone" dataKey="thisYear" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="lastYear" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Weather Events */}
          <div className="bg-[#1f1f24] p-6 rounded shadow">
            <h3 className="text-xl font-bold text-white">Active Weather Events</h3>
            <div className="mt-4 bg-gray-700 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={295}>
                <div className="space-y-4">
                  {activeWeatherEventsData.map((event, index) => (
                    <div key={index} className="flex justify-between text-lg text-white">
                      <span>{event.type}</span>
                      <span
                        className="text-lg font-semibold px-2 py-1 rounded"
                        style={{ backgroundColor: event.color }}
                      >
                        {event.status}
                      </span>
                    </div>
                  ))}
                </div>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Environmental Risk by Day */}
          <div className="bg-[#1f1f24] p-6 rounded shadow">
            <h3 className="text-xl font-bold text-white">Environmental Risk by Day</h3>
            <div className="mt-4 bg-gray-700 rounded-lg flex items-center justify-center" style={{ height: '300px' }}>
              <ResponsiveContainer width="95%" height={250}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="day" stroke="#c0c0df" />
                  <YAxis domain={[0, 10]} stroke="#c0c0df" />
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
                  />
                  <Bar dataKey="score" fill="#36a2eb" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk by Type */}
          <div className="bg-[#1f1f24] p-6 rounded shadow">
            <h3 className="text-xl font-bold text-white">Risk by Type</h3>
            <div className="mt-4 flex items-center bg-gray-700 rounded-lg p-4">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={270}>
                  <PieChart>
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
                    />
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 pl-4">
                {pieChartData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-lg text-white">{entry.name}</span>
                    <span className="text-lg text-gray-400 ml-auto">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Satellites by Country Chart */}
        <div className="bg-[#1f1f24] p-6 rounded shadow mt-6">
          <h3 className="text-xl font-bold text-white">Satellites by Country</h3>
          <div className="mt-4 bg-gray-700 rounded-lg flex items-center justify-center" style={{ height: '300px' }}>
            {loading ? (
              <p className="text-white">Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <ResponsiveContainer width="95%" height={250}>
                <BarChart data={satellitesByOwnerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="country" stroke="#c0c0df" />
                  <YAxis stroke="#c0c0df" />
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
                  />
                  <Bar dataKey="active_payload_count" fill="#36a2eb" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardModule;

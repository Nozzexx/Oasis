'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Search, Calendar } from 'lucide-react';

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

interface DateRange {
  start: string;
  end: string;
}

export default function NearEarthObjectsModule() {
  const [neoData, setNeoData] = useState<NEOData[]>([]);
  const [approachData, setApproachData] = useState<ApproachData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState<string | null>(null);
  const [searchInitiated, setSearchInitiated] = useState(false);

  const fetchData = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const [neoResponse, approachResponse] = await Promise.all([
        fetch(`/api/neo?start=${start}&end=${end}`),
        fetch(`/api/neo/approaches?start=${start}&end=${end}`)
      ]);
      
      if (!neoResponse.ok || !approachResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const neoData = await neoResponse.json();
      const approachData = await approachResponse.json();
      
      if (neoData.length === 0 && approachData.length === 0) {
        setError('No data available for the selected date range');
      }

      setNeoData(neoData);
      setApproachData(approachData);
    } catch (error) {
      setError('Error fetching data. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchInitiated(true);
    fetchData(dateRange.start, dateRange.end);
  };

  const formatDistance = (distance: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(distance);
  };

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Near Earth Objects (NEOs)</h1>
        <p className="text-gray-400">
          Tracking and analyzing objects in Earth's vicinity based on NASA's NEO database
        </p>
      </div>

      {/* Date Range Selection */}
      <div className="bg-[#1f1f24] p-4 rounded shadow mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" />
            <span>Start Date:</span>
            <input
              type="date"
              className="bg-gray-700 text-white rounded px-2 py-1"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" />
            <span>End Date:</span>
            <input
              type="date"
              className="bg-gray-700 text-white rounded px-2 py-1"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-4">Loading data...</div>}
      
      {error && (
        <div className="bg-red-500/20 text-red-500 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {!loading && !error && searchInitiated && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1f1f24] p-4 rounded shadow">
              <h2 className="text-lg font-semibold">Total NEOs</h2>
              <p className="text-3xl font-bold">{neoData.length}</p>
            </div>

            <div className="bg-[#1f1f24] p-4 rounded shadow">
              <h2 className="text-lg font-semibold">Potentially Hazardous</h2>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-orange-500">
                  {neoData.filter(neo => neo.is_potentially_hazardous).length}
                </p>
                {neoData.some(neo => neo.is_potentially_hazardous) && (
                  <AlertTriangle className="ml-2 text-orange-500" />
                )}
              </div>
            </div>

            <div className="bg-[#1f1f24] p-4 rounded shadow">
              <h2 className="text-lg font-semibold">Average Diameter</h2>
              <p className="text-3xl font-bold">
                {formatDistance(neoData.reduce((acc, neo) => acc + neo.estimated_diameter_km, 0) / neoData.length)} km
              </p>
            </div>

            <div className="bg-[#1f1f24] p-4 rounded shadow">
              <h2 className="text-lg font-semibold">Closest Approach</h2>
              <p className="text-3xl font-bold">
                {formatDistance(Math.min(...approachData.map(a => a.miss_distance_km)))} km
              </p>
            </div>
          </div>

          <div className="bg-[#1f1f24] p-6 mb-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Approach Distances Over Time</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={approachData}>
                  <XAxis 
                    dataKey="close_approach_date" 
                    stroke="#fff"
                    tick={{ fill: '#fff' }}
                  />
                  <YAxis 
                    stroke="#fff"
                    tick={{ fill: '#fff' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f1f24', 
                      borderColor: '#36a2eb',
                      color: '#fff' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="miss_distance_km" 
                    stroke="#36a2eb" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#1f1f24] p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">NEOs in Selected Period</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Diameter (km)</th>
                    <th className="p-2">Observation Date</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {neoData.map((neo) => (
                    <tr key={neo.id} className="border-t border-gray-700">
                      <td className="p-2">{neo.name}</td>
                      <td className="p-2">{formatDistance(neo.estimated_diameter_km)}</td>
                      <td className="p-2">{new Date(neo.observation_date).toLocaleDateString()}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          neo.is_potentially_hazardous 
                            ? 'bg-orange-500/20 text-orange-500' 
                            : 'bg-green-500/20 text-green-500'
                        }`}>
                          {neo.is_potentially_hazardous ? 'Hazardous' : 'Safe'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
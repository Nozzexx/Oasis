'use client';

import { useState } from 'react';

interface DataRow {
  id: number;
  name: string;
  type: string;
  status: string;
  dateLaunched: string;
}

const initialData: DataRow[] = [
  { id: 1, name: 'Satellite A', type: 'Satellite', status: 'Active', dateLaunched: '2020-05-12' },
  { id: 2, name: 'Satellite B', type: 'Satellite', status: 'Inactive', dateLaunched: '2018-09-25' },
  { id: 3, name: 'NEO 123', type: 'Near Earth Object', status: 'Tracking', dateLaunched: 'N/A' },
  { id: 4, name: 'Debris X', type: 'Debris', status: 'Monitoring', dateLaunched: 'N/A' },
  { id: 5, name: 'Satellite C', type: 'Satellite', status: 'Active', dateLaunched: '2019-03-11' },
];

export default function DataDisplayModule() {
  const [filter, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState<DataRow[]>(initialData);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilter(value);
    const filtered = initialData.filter((row) =>
      row.name.toLowerCase().includes(value.toLowerCase()) ||
      row.type.toLowerCase().includes(value.toLowerCase()) ||
      row.status.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Data Display</h1>
      <p className="mb-4">This is where data visualizations and statistics will be displayed.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Example Data Cards */}
        <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Total Objects</h2>
          <p className="text-gray-400">23,456 objects being tracked</p>
        </div>
        <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Active Satellites</h2>
          <p className="text-gray-400">4,321 active satellites</p>
        </div>
        <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Near Earth Objects</h2>
          <p className="text-gray-400">156 NEOs</p>
        </div>
      </div>

      {/* Filterable Table */}
      <div className="mt-8">
        <input
          type="text"
          placeholder="Filter by name, type, or status..."
          className="p-2 rounded-lg bg-[#333] text-white w-full mb-4"
          value={filter}
          onChange={handleFilterChange}
        />
        
        <table className="w-full text-left bg-[#2c2c2c] rounded-lg">
          <thead>
            <tr className="bg-[#1c1c1c]">
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date Launched</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-[#333]">
                  <td className="p-3">{row.name}</td>
                  <td className="p-3">{row.type}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">{row.dateLaunched}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-4">No matching records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

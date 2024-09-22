'use client';

import React from 'react';

const DashboardModule: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#ccf6e9] text-black p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Tracked Debris</h3>
          <p className="text-3xl font-bold">7,265</p>
          <p className="text-sm text-green-600">+11.02% ▲</p>
        </div>
        <div className="bg-[#f9b3b1] text-black p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Active Satellites</h3>
          <p className="text-3xl font-bold">3,671</p>
          <p className="text-sm text-red-600">-0.03% ▼</p>
        </div>
        <div className="bg-[#ccf6e9] text-black p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Near Earth Objects</h3>
          <p className="text-3xl font-bold">156</p>
          <p className="text-sm text-green-600">+15.03% ▲</p>
        </div>
        <div className="bg-[#ccf6e9] text-black p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Exoplanets</h3>
          <p className="text-3xl font-bold">2,318</p>
          <p className="text-sm text-green-600">+6.08% ▲</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        {/* Total Objects Chart */}
        <div className="col-span-2 bg-[#1f1f24] p-6 rounded shadow">
          <h3 className="text-xl font-bold text-white">Total Objects</h3>
          <p className="text-sm text-gray-400">This year vs. Last year</p>
          <div className="mt-4 h-40 bg-gray-700 rounded-lg"></div>
        </div>

        {/* Risk by Category */}
        <div className="bg-[#1f1f24] p-6 rounded shadow">
          <h3 className="text-xl font-bold text-white">Risk by Category</h3>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-white">
              <span>Traffic</span>
              <span className="text-gray-400">---</span>
            </div>
            <div className="flex justify-between text-sm text-white">
              <span>Satellites</span>
              <span className="text-gray-400">---</span>
            </div>
            <div className="flex justify-between text-sm text-white">
              <span>NEOs</span>
              <span className="text-gray-400">---</span>
            </div>
            <div className="flex justify-between text-sm text-white">
              <span>Debris</span>
              <span className="text-gray-400">---</span>
            </div>
            <div className="flex justify-between text-sm text-white">
              <span>Radiation</span>
              <span className="text-gray-400">---</span>
            </div>
            <div className="flex justify-between text-sm text-white">
              <span>Weather</span>
              <span className="text-gray-400">---</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Environmental Risk by Day */}
        <div className="bg-[#1f1f24] p-6 rounded shadow">
          <h3 className="text-xl font-bold text-white">Environmental Risk by Day</h3>
          <div className="mt-4 h-40 bg-gray-700 rounded-lg"></div>
        </div>

        {/* Risk by Type */}
        <div className="bg-[#1f1f24] p-6 rounded shadow">
          <h3 className="text-xl font-bold text-white">Risk by Type</h3>
          <div className="mt-4 h-40 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;

export default function SatelliteStatusModule() {
    return (
      <div className="p-6 text-white">
        <h1 className="text-3xl font-bold mb-4">Satellite Status</h1>
        <p className="mb-4">This module provides an overview of active satellites and their current status.</p>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Active Satellites</h2>
            <p className="text-gray-400">Current number of active satellites in orbit.</p>
          </div>
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Operational Issues</h2>
            <p className="text-gray-400">Details of satellites experiencing technical issues.</p>
          </div>
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Decommissioned Satellites</h2>
            <p className="text-gray-400">Satellites that have been decommissioned or are no longer operational.</p>
          </div>
        </div>
      </div>
    );
  }
  
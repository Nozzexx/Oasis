export default function NearEarthObjectsModule() {
    return (
      <div className="p-6 text-white">
        <h1 className="text-3xl font-bold mb-4">Near Earth Objects (NEOs)</h1>
        <p className="mb-4">This section tracks Near Earth Objects (NEOs) and their risk assessment based on proximity to Earth.</p>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Example NEO Data Card */}
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Total NEOs</h2>
            <p className="text-gray-400">156 objects</p>
          </div>
  
          {/* Example NEO Data Card */}
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Potential Hazardous NEOs</h2>
            <p className="text-gray-400">12 objects</p>
          </div>
  
          {/* Example NEO Data Card */}
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Closest Approach</h2>
            <p className="text-gray-400">0.002 AU</p>
          </div>
        </div>
  
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">NEO Proximity Chart</h2>
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            {/* Placeholder for a chart */}
            <p className="text-gray-400">[Chart showing the proximity of NEOs to Earth over time]</p>
          </div>
        </div>
  
        {/* More data visualization or components can be added here */}
      </div>
    );
  }
  
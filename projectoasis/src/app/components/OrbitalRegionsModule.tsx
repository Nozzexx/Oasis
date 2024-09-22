export default function OrbitalRegionsModule() {
    return (
      <div className="p-6 text-white">
        <h1 className="text-3xl font-bold mb-4">Orbital Regions</h1>
        <p className="mb-4">This module focuses on data and analysis of various orbital regions around Earth.</p>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Low Earth Orbit (LEO)</h2>
            <p className="text-gray-400">Details about LEO satellites and objects.</p>
          </div>
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Medium Earth Orbit (MEO)</h2>
            <p className="text-gray-400">Details about MEO satellites and objects.</p>
          </div>
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Geostationary Orbit (GEO)</h2>
            <p className="text-gray-400">Details about GEO satellites and objects.</p>
          </div>
        </div>
      </div>
    );
  }
  
export default function SpaceWeatherModule() {
    return (
      <div className="p-6 text-white">
        <h1 className="text-3xl font-bold mb-4">Space Weather</h1>
        <p className="mb-4">This module provides information and analysis on space weather phenomena such as solar flares and geomagnetic storms.</p>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Solar Flare Activity</h2>
            <p className="text-gray-400">Recent solar flare data and predictions.</p>
          </div>
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Geomagnetic Storms</h2>
            <p className="text-gray-400">Impact of geomagnetic storms on satellites and space missions.</p>
          </div>
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Aurora Activity</h2>
            <p className="text-gray-400">Tracking auroras and their causes.</p>
          </div>
        </div>
      </div>
    );
  }
  
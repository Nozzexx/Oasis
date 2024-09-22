export default function DataDisplayModule() {
    return (
      <div className="p-6 text-white">
        <h1 className="text-3xl font-bold mb-4">Data Display</h1>
        <p className="mb-4">This is where data visualizations and statistics will be displayed.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Example Data Card */}
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Total Objects</h2>
            <p className="text-gray-400">23,456 objects being tracked</p>
          </div>
  
          {/* Example Data Card */}
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Active Satellites</h2>
            <p className="text-gray-400">4,321 active satellites</p>
          </div>
  
          {/* Example Data Card */}
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Near Earth Objects</h2>
            <p className="text-gray-400">156 NEOs</p>
          </div>
        </div>
  
        {/* More data visualization components can be added here */}
      </div>
    );
  }
  
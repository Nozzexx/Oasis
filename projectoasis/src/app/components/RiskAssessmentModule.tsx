export default function RiskAssessmentModule() {
    return (
      <div className="p-6 text-white">
        <h1 className="text-3xl font-bold mb-4">Risk Assessment</h1>
        <p className="mb-4">This module helps in assessing the risk posed by space objects and near-Earth phenomena.</p>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Collision Risks</h2>
            <p className="text-gray-400">Current satellite and debris collision risks.</p>
          </div>
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Hazardous NEOs</h2>
            <p className="text-gray-400">Tracking and analyzing hazardous Near-Earth Objects (NEOs).</p>
          </div>
          <div className="bg-[#2c2c2c] p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Space Weather Impact</h2>
            <p className="text-gray-400">Assessing the impact of space weather events on satellites and spacecraft.</p>
          </div>
        </div>
      </div>
    );
  }
  
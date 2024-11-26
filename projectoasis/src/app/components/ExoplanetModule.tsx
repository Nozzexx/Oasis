import React from 'react';

export default function ExoplanetModule() {
  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Exoplanet Exploration</h1>
      <p className="mb-8">
        This module will provide information and analysis on exoplanets, including detection methods, habitability, and more.
      </p>

      {/* Placeholder for future charts, graphs, and data visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4">Placeholder for Exoplanet Content</h2>
          <p className="text-gray-400">Future content will go here.</p>
        </div>
      </div>
    </div>
  );
}
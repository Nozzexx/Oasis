'use client';

import DashboardLayout from './components/Layout';
import DashboardModule from './components/DashboardModule';
import DataDisplayModule from './components/DataDisplayModule';
import NearEarthObjectsModule from './components/NearEarthObjectsModule';
import OrbitalRegionsModule from './components/OrbitalRegionsModule';
import SpaceWeatherModule from './components/SpaceWeatherModule';
import RiskAssessmentModule from './components/RiskAssessmentModule';
import SatelliteStatusModule from './components/SatelliteStatusModule';
import DebrisTrackingModule from './components/DebrisTrackingModule';
import ExoplanetModule from './components/ExoplanetModule';

export default function Page() {
  return (
    <DashboardLayout>
      <main className="flex-1 overflow-y-auto bg-[#1c1c1c] relative">
        <div 
          style={{
            opacity: 0.8,
            backgroundImage: `
              linear-gradient(#222222 2px, transparent 2px),
              linear-gradient(90deg, #222222 2px, transparent 2px),
              linear-gradient(#222222 1px, transparent 1px),
              linear-gradient(90deg, #222222 1px, #1c1c1c 1px)
            `,
            backgroundSize: '50px 50px, 50px 50px, 10px 10px, 10px 10px',
            backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px',
          }}
        >
          {/* Your main content will be rendered here by the Layout component */}
        </div>
      </main>
    </DashboardLayout>
  );
}
import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

import { GiSunRadiations } from "react-icons/gi";
import { FiSunrise } from "react-icons/fi";
import { TbSunElectricity } from "react-icons/tb";


// Register necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function SpaceWeatherModule() {
  const [solarFlareData, setSolarFlareData] = useState([]);
  const [cmeData, setCmeData] = useState([]);
  const [geostormData, setGeostormData] = useState([]);
  const [impactsByType, setImpactsByType] = useState({
    solarFlares: [] as string[],
    cmes: [] as string[],
    geostorms: [] as string[],
  });
  const [solarFlareStats, setSolarFlareStats] = useState({
    strongestFlare: '',
    classDistribution: { X: 0, M: 0, C: 0 },
  });
  const [fastestCME, setFastestCME] = useState('');
  const [collapse, setCollapse] = useState({
    solarFlares: false,
    cmes: false,
    geostorms: false,
  });

  // Fetch data
  useEffect(() => {
    async function fetchData(eventType: string, setData: Function, startDate: string = '', endDate: string = '2024-11-21') {
      const query = startDate ? `start=${startDate}&end=${endDate}` : `end=${endDate}`;
      const response = await fetch(`/api/spaceweather?type=${eventType}&${query}`);
      const data = await response.json();
      setData(data);
    }

    fetchData('solar_flare', setSolarFlareData, '2024-11-01');
    fetchData('cme', setCmeData, '2024-11-01');
    fetchData('geostorm', setGeostormData, '2010-01-01');
  }, []);

  // Calculate stats and insights
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const solarFlares: string[] = [];
    const cmes: string[] = [];
    const geostorms: string[] = [];

    let strongestFlare = '';
    const classDistribution = { X: 0, M: 0, C: 0 };

    solarFlareData.forEach((flare: any) => {
      const flareDate = new Date(flare.peak_time);
      if (flareDate.getFullYear() === currentYear && flareDate.getMonth() === currentMonth) {
        if (flare.class_type.startsWith('X')) {
          classDistribution.X += 1;
          solarFlares.push(
            `⚡ High-intensity solar flare detected (Class: ${flare.class_type}) on ${flare.peak_time}. Possible radio blackouts and satellite communication disruptions.`
          );
        } else if (flare.class_type.startsWith('M')) {
          classDistribution.M += 1;
          solarFlares.push(
            `📡 Moderate solar flare detected (Class: ${flare.class_type}) on ${flare.peak_time}. Minor impacts on HF communication.`
          );
        } else if (flare.class_type.startsWith('C')) {
          classDistribution.C += 1;
        }

        if (!strongestFlare || flare.class_type > strongestFlare) {
          strongestFlare = `${flare.class_type} on ${flare.peak_time}`;
        }
      }
    });

    let fastestCMESpeed = 0;
    let fastestCMEEvent = '';

    cmeData.forEach((cme: any) => {
      const cmeDate = new Date(cme.start_time);
      if (cmeDate.getFullYear() === currentYear && cmeDate.getMonth() === currentMonth) {
        if (cme.speed > 750) {
          cmes.push(
            `💨 High-speed CME detected (Speed: ${cme.speed} km/s) on ${cme.start_time}. Potential for geomagnetic storms and power grid impacts.`
          );
        }
        if (cme.speed > fastestCMESpeed) {
          fastestCMESpeed = cme.speed;
          fastestCMEEvent = `${cme.speed} km/s on ${cme.start_time}`;
        }
      }
    });

    geostormData.forEach((storm: any) => {
      const stormDate = new Date(storm.observed_time);
      if (stormDate.getFullYear() === currentYear && stormDate.getMonth() === currentMonth) {
        if (storm.kp_index >= 7) {
          geostorms.push(
            `🌌 Severe geomagnetic storm detected (KP Index: ${storm.kp_index}) on ${storm.observed_time}. Possible power grid failures and widespread aurora visibility.`
          );
        } else if (storm.kp_index >= 5) {
          geostorms.push(
            `🌍 Moderate geomagnetic storm detected (KP Index: ${storm.kp_index}) on ${storm.observed_time}. Some satellite orientation issues and aurora activity expected.`
          );
        }
      }
    });

    setImpactsByType({ solarFlares, cmes, geostorms });
    setSolarFlareStats({ strongestFlare, classDistribution });
    setFastestCME(fastestCMEEvent);
  }, [solarFlareData, cmeData, geostormData]);

  const toggleCollapse = (type: string) => {
    setCollapse((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Space Weather</h1>
      <p className="mb-8">This module provides information and analysis on space weather phenomena such as solar flares and geomagnetic storms.</p>

      {/* Weather Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Solar Flare Activity */}
        <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4">Solar Flare Activity</h2>
          <Line
            data={{
              labels: solarFlareData.map((item: any) => item.peak_time),
              datasets: [
                {
                  label: 'Solar Flare Intensity',
                  data: solarFlareData.map((item: any) => parseFloat(item.class_type.replace(/[A-Za-z]/g, ''))),
                  borderColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                },
              ],
            }}
          />
        </div>

        {/* Coronal Mass Ejections */}
        <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4">Coronal Mass Ejections</h2>
          <Bar
            data={{
              labels: cmeData.map((item: any) => item.start_time),
              datasets: [
                {
                  label: 'CME Speed (km/s)',
                  data: cmeData.map((item: any) => item.speed),
                  borderColor: 'rgba(54, 162, 235, 1)',
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                },
              ],
            }}
          />
        </div>

        {/* Geomagnetic Storms */}
        <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4">Geomagnetic Storms (2010 - Present)</h2>
          <Bar
            data={{
              labels: geostormData.map((item: any) => item.observed_time),
              datasets: [
                {
                  label: 'KP Index',
                  data: geostormData.map((item: any) => item.kp_index),
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                },
              ],
            }}
          />
        </div>
      </div>

      {/* Solar Flare Distribution and Impacts */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* Solar Flare Distribution Box */}
      <div className="bg-[#2c2c2c] p-8 rounded-lg shadow-md h-[38rem]">
        <h3 className="text-lg font-bold mb-6">Solar Flare Class Distribution</h3>
        <div className="w-[99%] h-[99%] flex justify-center items-center">
          <Pie
            data={{
              labels: ['X-Class', 'M-Class', 'C-Class'],
              datasets: [
                {
                  label: 'Solar Flare Distribution',
                  data: [
                    solarFlareStats.classDistribution.X,
                    solarFlareStats.classDistribution.M,
                    solarFlareStats.classDistribution.C,
                  ],
                  backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    color: '#ffffff',
                    boxWidth: 20,
                    padding: 10,
                  },
                },
              },
              maintainAspectRatio: true,
              responsive: true,
            }}
          />
        </div>
      </div>

      {/* Weather Impacts Box */}
      <div className="bg-[#2c2c2c] p-8 rounded-lg shadow-md h-[38rem] overflow-y-auto">
        <h3 className="text-lg font-bold mb-6">Latest Space Weather Impacts</h3>

        {/* Solar Flares Section */}
        <div className="mb-4">
          <div
            className="cursor-pointer text-md font-semibold mb-2 text-gray-300 flex justify-between items-center"
            onClick={() => toggleCollapse('solarFlares')}
          >
            <GiSunRadiations className="text-white-800" /> Solar Flares
            <span>{collapse.solarFlares ? '▼' : '►'}</span>
          </div>
          {!collapse.solarFlares && (
            <ul className="list-disc list-inside space-y-2">
              {impactsByType.solarFlares.slice(0, 5).map((impact, index) => (
                <li key={`solar-${index}`} className="text-sm">{impact}</li>
              ))}
            </ul>
          )}
        </div>

        {/* CMEs Section */}
        <div className="mb-4">
          <div
            className="cursor-pointer text-md font-semibold mb-2 text-gray-300 flex justify-between items-center"
            onClick={() => toggleCollapse('cmes')}
          >
            <FiSunrise className="text-white-800" /> Coronal Mass Ejections
            <span>{collapse.cmes ? '▼' : '►'}</span>
          </div>
          {!collapse.cmes && (
            <ul className="list-disc list-inside space-y-2">
              {impactsByType.cmes.slice(0, 5).map((impact, index) => (
                <li key={`cme-${index}`} className="text-sm">{impact}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Geomagnetic Storms Section */}
        <div>
          <div
            className="cursor-pointer text-md font-semibold mb-2 text-gray-300 flex justify-between items-center"
            onClick={() => toggleCollapse('geostorms')}
          >
            <TbSunElectricity className="text-white-800" /> Geomagnetic Storms
            <span>{collapse.geostorms ? '▼' : '►'}</span>
          </div>
          {!collapse.geostorms && impactsByType.geostorms.slice(0, 5).length > 0 && (
            <ul className="list-disc list-inside space-y-2">
              {impactsByType.geostorms.slice(0, 5).map((impact, index) => (
                <li key={`storm-${index}`} className="text-sm">{impact}</li>
              ))}
            </ul>
          )}
          {!collapse.geostorms && impactsByType.geostorms.slice(0, 5).length === 0 && (
            <p className="text-sm text-gray-400">No geomagnetic storm impacts detected this month.</p>
          )}
        </div>
      </div>
    </div>

    </div>
  );
}

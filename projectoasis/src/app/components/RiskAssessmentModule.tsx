'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Define types
interface EnvironmentalScore {
  id: number;
  timestamp: string;
  region: string;
  risk_score: number;
  flare_risk: number;
  cme_risk: number;
  storm_risk: number;
  debris_risk: number;
  data_status: string;
  confidence_score: number;
  model_version: string;
}

interface RiskBarProps {
  label: string;
  value: number;
  color: string;
  tooltipText: string;
}

// Helper function to safely format risk scores
const formatRiskScore = (score: any): number => {
  const numScore = typeof score === 'string' ? parseFloat(score) : Number(score);
  return isNaN(numScore) ? 0 : numScore;
};

const RiskBar: React.FC<RiskBarProps> = ({ label, value, color, tooltipText }) => (
  <div className="flex justify-between items-center group relative">
    <span className="text-gray-400">{label}</span>
    <div className="w-24 bg-gray-700 rounded-full h-2 relative">
      <div 
        className={`${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${(formatRiskScore(value) / 10) * 100}%` }}
      />
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
        {tooltipText}
      </div>
    </div>
  </div>
);

export default function RiskAssessmentModule() {
  const [environmentalScores, setEnvironmentalScores] = useState<EnvironmentalScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<EnvironmentalScore | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch('/api/environmental-scores');
        if (!response.ok) throw new Error('Failed to fetch environmental scores');
        const data = await response.json();

        // Transform data to ensure numbers
        const transformedData = data.map((score: any) => ({
          ...score,
          risk_score: formatRiskScore(score.risk_score),
          flare_risk: formatRiskScore(score.flare_risk),
          cme_risk: formatRiskScore(score.cme_risk),
          storm_risk: formatRiskScore(score.storm_risk),
          debris_risk: formatRiskScore(score.debris_risk),
          confidence_score: formatRiskScore(score.confidence_score)
        }));

        setEnvironmentalScores(transformedData);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
    const interval = setInterval(fetchScores, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (score: any): string => {
    const numScore = formatRiskScore(score);
    if (numScore >= 7) return 'bg-red-500';
    if (numScore >= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLatestScores = (): EnvironmentalScore[] => {
    const latestByRegion = new Map<string, EnvironmentalScore>();
    environmentalScores.forEach(score => {
      if (!latestByRegion.has(score.region) || 
          new Date(score.timestamp) > new Date(latestByRegion.get(score.region)!.timestamp)) {
        latestByRegion.set(score.region, score);
      }
    });
    return Array.from(latestByRegion.values());
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <div>Loading risk assessment data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const latestScores = getLatestScores();

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Space Environmental Risk Assessment</h1>
        <p className="text-gray-400 mt-2">
          Real-time analysis of environmental risks across different orbital regions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {latestScores.map((score) => (
          <div 
            key={score.region}
            className="bg-[#2c2c2c] rounded-lg shadow-lg overflow-hidden hover:bg-[#363636] transition-colors cursor-pointer"
            onClick={() => setSelectedRegion(score)}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Region {score.region}</h2>
                <div 
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(score.risk_score)} text-white relative group`}
                >
                  {formatRiskScore(score.risk_score).toFixed(1)}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Overall Risk Score: {formatRiskScore(score.risk_score).toFixed(3)}
                  </div>
                </div>
              </div>

              {score.data_status !== 'Data Available' && (
                <div className="flex items-center space-x-2 text-yellow-500 mb-4">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">Limited or No Data Available</span>
                </div>
              )}

              <div className="space-y-2">
                <RiskBar 
                  label="Solar Flare Risk:" 
                  value={score.flare_risk} 
                  color="bg-blue-500"
                  tooltipText={`Solar Flare Risk: ${formatRiskScore(score.flare_risk).toFixed(3)}`}
                />
                <RiskBar 
                  label="CME Risk:" 
                  value={score.cme_risk} 
                  color="bg-purple-500"
                  tooltipText={`CME Risk: ${formatRiskScore(score.cme_risk).toFixed(3)}`}
                />
                <RiskBar 
                  label="Storm Risk:" 
                  value={score.storm_risk} 
                  color="bg-yellow-500"
                  tooltipText={`Storm Risk: ${formatRiskScore(score.storm_risk).toFixed(3)}`}
                />
                <RiskBar 
                  label="Debris Risk:" 
                  value={score.debris_risk} 
                  color="bg-red-500"
                  tooltipText={`Debris Risk: ${formatRiskScore(score.debris_risk).toFixed(3)}`}
                />
              </div>

              <div className="mt-4">
                <div className="text-xs text-gray-500">
                  Last updated: {new Date(score.timestamp).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 group relative">
                  Confidence Score: {(formatRiskScore(score.confidence_score) * 100).toFixed(1)}%
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Raw Confidence Score: {formatRiskScore(score.confidence_score).toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRegion && (
        <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-lg mt-6">
          <h2 className="text-xl font-bold mb-4">Risk Trend - Region {selectedRegion.region}</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={environmentalScores.filter(score => score.region === selectedRegion.region)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                  stroke="#888" 
                />
                <YAxis stroke="#888" domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f1f24',
                    border: '1px solid #333',
                    borderRadius: '4px'
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Legend />
                <Line type="monotone" dataKey="risk_score" name="Overall Risk" stroke="#36a2eb" strokeWidth={2} />
                <Line type="monotone" dataKey="flare_risk" name="Flare Risk" stroke="#2563eb" />
                <Line type="monotone" dataKey="cme_risk" name="CME Risk" stroke="#7c3aed" />
                <Line type="monotone" dataKey="storm_risk" name="Storm Risk" stroke="#eab308" />
                <Line type="monotone" dataKey="debris_risk" name="Debris Risk" stroke="#dc2626" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mt-8 bg-[#2c2c2c] p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-5 h-5 text-blue-400" />
          <span className="font-semibold">Understanding the Risk Assessment</span>
        </div>
        <p className="text-sm text-gray-400">
          Risk scores range from 1-10, where higher values indicate greater risk. 
          These scores are calculated using real-time data from solar activity, space weather conditions, 
          and orbital debris tracking. The assessment includes solar flare activity, coronal mass ejections (CMEs),
          geomagnetic storms, and space debris density. Regions with limited or no data are marked accordingly.
          Confidence scores indicate the reliability of the risk assessment based on data availability and quality.
        </p>
      </div>
    </div>
  );
}
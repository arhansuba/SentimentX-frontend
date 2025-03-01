import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import ContractOverview from './ContractOverview';

// Mock data for the hackathon demo
const RISK_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  none: '#3b82f6'
};

interface AlertStats {
  totalAlerts: number;
  openAlerts: number;
  highRiskAlerts: number;
  alertsByRiskLevel: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    none: number;
  };
  topVulnerableContracts: {
    address: string;
    alertCount: number;
  }[];
  topVulnerabilityPatterns: {
    patternId: string;
    count: number;
  }[];
}

interface MonitoredContract {
  address: string;
  name: string;
  securityScore: number;
  alertCount: number;
  highRiskAlerts: number;
}

interface DashboardProps {
  stats: {
    contractsMonitored: number;
    contractsAtRisk: number;
    activeAlerts: number;
    resolvedAlerts: number;
    transactionsMonitored: number;
    anomaliesDetected: number;
    securityScore: number;
  };
  networkInfo: {
    chainId: string;
  };
  userAddress: string;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, networkInfo, userAddress }) => {
  const [loading, setLoading] = useState(true);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [monitoredContracts, setMonitoredContracts] = useState<MonitoredContract[]>([]);

  useEffect(() => {
    // In a real implementation, these would be API calls
    // For the hackathon demo, we'll use mock data that would be returned from our backend
    
    setTimeout(() => {
      setAlertStats({
        totalAlerts: 87,
        openAlerts: 42,
        highRiskAlerts: 15,
        alertsByRiskLevel: {
          critical: 5,
          high: 10,
          medium: 27,
          low: 45,
          none: 0,
        },
        topVulnerableContracts: [
          { address: 'erd1qqqqqqqqqqqqqpgq5l7ks6p8x20u8ehc3kr0gs35l687n24ay40q2f254k', alertCount: 23 },
          { address: 'erd1qqqqqqqqqqqqqpgqje5ntxlg77zkgvqtc2kzgq05ucrztc8a59asgmjp0q', alertCount: 18 },
          { address: 'erd1qqqqqqqqqqqqqpgqgrl5ukxzrugz8t850ktgtmtlyh3ygzj3y40qcnkepz', alertCount: 15 },
        ],
        topVulnerabilityPatterns: [
          { patternId: 'reentrancy', count: 12 },
          { patternId: 'flash-loan-attack', count: 8 },
          { patternId: 'access-control', count: 24 },
          { patternId: 'integer-overflow', count: 7 },
          { patternId: 'suspicious-token-transfers', count: 31 },
        ]
      });
      
      setMonitoredContracts([
        { 
          address: 'erd1qqqqqqqqqqqqqpgq5l7ks6p8x20u8ehc3kr0gs35l687n24ay40q2f254k',
          name: 'Lending Protocol',
          securityScore: 68,
          alertCount: 23,
          highRiskAlerts: 7
        },
        { 
          address: 'erd1qqqqqqqqqqqqqpgqje5ntxlg77zkgvqtc2kzgq05ucrztc8a59asgmjp0q',
          name: 'NFT Marketplace',
          securityScore: 82,
          alertCount: 18,
          highRiskAlerts: 3
        },
        { 
          address: 'erd1qqqqqqqqqqqqqpgqgrl5ukxzrugz8t850ktgtmtlyh3ygzj3y40qcnkepz',
          name: 'Swap Protocol',
          securityScore: 74,
          alertCount: 15,
          highRiskAlerts: 5
        },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  // Transform alert stats for pie chart
  const alertsByRiskLevelData = alertStats ? 
    Object.entries(alertStats.alertsByRiskLevel)
      .filter(([_, value]) => value > 0)
      .map(([level, count]) => ({ 
        name: level.charAt(0).toUpperCase() + level.slice(1), 
        value: count 
      })) : [];

  // Transform vulnerability patterns for bar chart
  const vulnerabilityPatternsData = alertStats ? 
    alertStats.topVulnerabilityPatterns.map(({ patternId, count }) => ({
      name: patternId
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      count
    })) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">MultiversX AI Smart Contract Sentinel</h1>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-500">Total Alerts</h3>
          <p className="text-3xl font-bold">{alertStats?.totalAlerts}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-500">Open Alerts</h3>
          <p className="text-3xl font-bold text-amber-500">{alertStats?.openAlerts}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-500">High Risk Alerts</h3>
          <p className="text-3xl font-bold text-red-500">{alertStats?.highRiskAlerts}</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-medium text-gray-500">Monitored Contracts</h3>
          <p className="text-3xl font-bold text-blue-500">{monitoredContracts.length}</p>
        </div>
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-6">Alerts by Risk Level</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alertsByRiskLevelData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {alertsByRiskLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name.toLowerCase() as keyof typeof RISK_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-6">Top Vulnerability Patterns</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={vulnerabilityPatternsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart> 
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Monitored contracts section */}
      <div className="bg-white rounded-lg p-6 shadow mb-8">
        <h2 className="text-xl font-semibold mb-6">Monitored Contracts</h2>
        <div className="space-y-6">
          {monitoredContracts.map((contract) => (
            <ContractOverview key={contract.address} contract={[contract]} />
          ))}
        </div>
      </div>
      
      {/* Latest alerts section */}
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Latest Alerts</h2>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vulnerability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Lending Protocol
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Critical
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Reentrancy
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2 minutes ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Open
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  NFT Marketplace
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                    High
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Access Control
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  15 minutes ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Open
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Swap Protocol
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Medium
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Suspicious Token Transfers
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  1 hour ago
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Resolved
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>Contracts Monitored: {stats.contractsMonitored}</div>
      <div>Network Chain ID: {networkInfo.chainId}</div>
      <div>User Address: {userAddress}</div>
    </div>
  );
};

export default Dashboard;
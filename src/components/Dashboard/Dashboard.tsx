/* eslint-disable react-hooks/exhaustive-deps */
// src/components/Dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../common/Card';

import ContractOverview from './ContractOverview';
import { Alert } from '@mui/material';
import LoadingSpinner from '../common/LoadingSpinner';
import { fetchAlertData, fetchContractsData } from '../../services/fetchProxy';

// Define consistent color scheme for risk levels
const RISK_COLORS = {
  Critical: '#dc2626', // red-600
  High: '#ea580c', // orange-600
  Medium: '#ca8a04', // yellow-600
  Low: '#16a34a', // green-600
  None: '#2563eb', // blue-600
};

interface AlertStats {
  totalAlerts: number;
  openAlerts: number;
  highRiskAlerts: number;
  alertsByRiskLevel: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
    None: number;
  };
  topVulnerableContracts: {
    address: string;
    name: string;
    alertCount: number;
  }[];
  topVulnerabilityPatterns: {
    patternId: string;
    count: number;
  }[];
}

interface MonitoredContract {
  id: string;
  address: string;
  name: string;
  securityScore: number;
  alertCount: number;
  highRiskAlerts: number;
  lastActivityDate: string;
  deploymentTransaction: string;
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
  //userAddress: string;
  networkInfo: {
    chainId: string;
  }
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertStats, setAlertStats] = useState<AlertStats | null>(null);
  const [monitoredContracts, setMonitoredContracts] = useState<MonitoredContract[]>([]);
  const [latestAlerts, setLatestAlerts] = useState<any[]>([]);
  const [networkInfo, setNetworkInfo] = useState({ chainId: 'D' });

  useEffect(() => {
    fetchComponentData();
  }, []);

  const fetchComponentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get data using our proxy fetchers with built-in fallbacks
      const [alertData, contractsData] = await Promise.all([
        fetchAlertData(),
        fetchContractsData()
      ]);
      
      // Set component state with fetched or fallback data
      setAlertStats(alertData.alertStats);
      setLatestAlerts(alertData.latestAlerts);
      setMonitoredContracts(contractsData.contracts);
      
      // Use network info from props (already fetched in parent)
      setNetworkInfo(props.networkInfo || { chainId: 'D' });
    } catch (err: any) {
      console.error('Error fetching dashboard component data:', err);
      setError('Failed to load some dashboard components.');
      // No need to call setFallbackData() since our fetchers handle fallbacks
    } finally {
      setLoading(false);
    }
  };


  // Transform alert stats for pie chart
  const alertsByRiskLevelData = alertStats ? 
    Object.entries(alertStats.alertsByRiskLevel)
      .filter(([_, value]) => value > 0)
      .map(([level, count]) => ({ 
        name: level, 
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
    })).sort((a, b) => b.count - a.count) : [];

  // Format timestamp
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">MultiversX AI Smart Contract Sentinel</h1>
      
      {error && (
        <Alert 
          severity="error" 
          className="mb-6"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition mb-8"
        onClick={fetchComponentData}
      >
        Refresh Data
      </button>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-bold mb-4">Total Alerts</h2>
          <div className="flex items-end">
            <span className="text-4xl font-bold">{alertStats?.totalAlerts || 0}</span>
            <span className="ml-2 text-sm text-gray-500 mb-1">alerts detected</span>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-bold mb-4">Open Alerts</h2>
          <div className="flex items-end">
            <span className="text-4xl font-bold text-amber-500">{alertStats?.openAlerts || 0}</span>
            <span className="ml-2 text-sm text-gray-500 mb-1">need attention</span>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-bold mb-4">High Risk Alerts</h2>
          <div className="flex items-end">
            <span className="text-4xl font-bold text-red-500">{alertStats?.highRiskAlerts || 0}</span>
            <span className="ml-2 text-sm text-gray-500 mb-1">critical issues</span>
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-bold mb-4">Monitored Contracts</h2>
          <div className="flex items-end">
            <span className="text-4xl font-bold text-blue-500">{monitoredContracts.length}</span>
            <span className="ml-2 text-sm text-gray-500 mb-1">under protection</span>
          </div>
        </Card>
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <h2 className="text-xl font-bold mb-4">Alerts by Risk Level</h2>
          <div className="h-80">
            {alertsByRiskLevelData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertsByRiskLevelData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {alertsByRiskLevelData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS]} 
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} alerts`, 'Count']} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span style={{ color: RISK_COLORS[value as keyof typeof RISK_COLORS] }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No alerts data available</p>
              </div>
            )}
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-bold mb-4">Top Vulnerability Patterns</h2>
          <div className="h-80">
            {vulnerabilityPatternsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vulnerabilityPatternsData.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip formatter={(value) => [`${value} instances`, 'Count']} />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart> 
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No vulnerability patterns data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Monitored contracts section */}
      <Card 
        title="Monitored Contracts" 
        headerAction={
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            onClick={() => window.location.href = '/contracts'}
          >
            View All
          </button>
        }
        className="mb-8"
      >
        {monitoredContracts.length > 0 ? (
          <div className="space-y-6">
            {monitoredContracts.slice(0, 3).map((contract) => (
              <ContractOverview 
                key={contract.id} 
                contract={contract} 
                className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">No contracts are being monitored yet.</p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              onClick={() => window.location.href = '/upload-contract'}
            >
              Upload Your First Contract
            </button>
          </div>
        )}
      </Card>
      
      {/* Latest alerts section */}
      <Card 
        title="Latest Alerts" 
        headerAction={
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            onClick={() => window.location.href = '/alerts'}
          >
            View All
          </button>
        }
      >
        {latestAlerts.length > 0 ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {latestAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.contractName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${alert.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' : 
                          alert.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' : 
                          alert.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {alert.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.vulnerabilityType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeAgo(alert.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${alert.status === 'Open' ? 'bg-yellow-100 text-yellow-800' : 
                          alert.status === 'Acknowledged' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => window.location.href = `/alerts/${alert.id}`}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">No alerts have been detected yet.</p>
            <p className="text-sm text-gray-400">
              Alerts will appear here when vulnerabilities are detected in your contracts.
            </p>
          </div>
        )}
      </Card>
      
      {/* Network info */}
      <div className="mt-8 bg-gray-100 p-4 rounded-md text-sm text-gray-600">
        <p>Network: MultiversX {networkInfo.chainId === 'D' ? 'Devnet' : 
                              networkInfo.chainId === 'T' ? 'Testnet' : 'Mainnet'}</p>
      </div>
    </div>
  );
};

export default Dashboard;
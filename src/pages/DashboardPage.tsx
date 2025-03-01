import React, { useState, useEffect } from 'react';
import Dashboard from '../components/Dashboard/Dashboard';
import ContractOverview from '../components/Dashboard/ContractOverview';
import SecurityScore from '../components/Dashboard/SecurityScore';
import AlertsList from '../components/Alerts/AlertsList';
import TransactionsList from '../components/Transactions/TransactionsList';
//import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/accounts';
import { useGetAccountInfo, useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks';

interface DashboardStats {
  contractsMonitored: number;
  contractsAtRisk: number;
  activeAlerts: number;
  resolvedAlerts: number;
  transactionsMonitored: number;
  anomaliesDetected: number;
  securityScore: number;
}

interface RecentContract {
  address: string;
  name: string;
  riskScore: number;
  lastActivity: string;
  alertCount: number;
}

const DashboardPage: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { network } = useGetNetworkConfig();
  
  const [stats, setStats] = useState<DashboardStats>({
    contractsMonitored: 0,
    contractsAtRisk: 0,
    activeAlerts: 0,
    resolvedAlerts: 0,
    transactionsMonitored: 0,
    anomaliesDetected: 0,
    securityScore: 0
  });
  
  const [recentContracts, setRecentContracts] = useState<RecentContract[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real application, we would fetch actual data from backend APIs
        const dashboardResponse = await fetch('/api/dashboard');
        const dashboardData = await dashboardResponse.json();
        
        setStats(dashboardData.stats);
        setRecentContracts(dashboardData.recentContracts);
        setRecentAlerts(dashboardData.recentAlerts);
        setRecentTransactions(dashboardData.recentTransactions);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set mock data for demonstration purposes
        setMockData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const setMockData = () => {
    // Mock dashboard stats
    setStats({
      contractsMonitored: 47,
      contractsAtRisk: 8,
      activeAlerts: 14,
      resolvedAlerts: 23,
      transactionsMonitored: 1243,
      anomaliesDetected: 17,
      securityScore: 78
    });
    
    // Mock recent contracts
    setRecentContracts([
      {
        address: 'erd1qqqqqqqqqqqqqpgqhpy2hy93d6zunv3chlepyz2aknmw4f8htthsa7wxzc',
        name: 'ElrondSwap',
        riskScore: 12,
        lastActivity: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        alertCount: 0
      },
      {
        address: 'erd1qqqqqqqqqqqqqpgq04jn4shq6pfa7tclkfpvzt33rz30ezxhttsspkxu7c',
        name: 'XMEX Staking',
        riskScore: 35,
        lastActivity: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        alertCount: 2
      },
      {
        address: 'erd1qqqqqqqqqqqqqpgq2tmhtzh8yvmzst46u5zk4amwgtr7xyf0httsmm2twr',
        name: 'NFT Marketplace',
        riskScore: 68,
        lastActivity: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        alertCount: 5
      }
    ]);
    
    // Mock alerts data (structure needs to match AlertsList component)
    setRecentAlerts([
      {
        id: 'alert-1',
        title: 'Reentrancy Vulnerability Detected',
        severity: 'high',
        sourceType: 'contract',
        sourceId: 'erd1qqqqqqqqqqqqqpgq2tmhtzh8yvmzst46u5zk4amwgtr7xyf0httsmm2twr',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'new',
        description: 'Potential reentrancy vulnerability detected in contract function withdrawFunds()'
      },
      {
        id: 'alert-2',
        title: 'Unusual Transaction Pattern',
        severity: 'medium',
        sourceType: 'transaction',
        sourceId: 'c9e58f7494df4457105ed98eb6521020bc2a2a4147c9d8079d467e6affba8500',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'acknowledged',
        description: 'Unusual pattern detected with multiple small transactions from same address within short timeframe'
      },
      {
        id: 'alert-3',
        title: 'Access Control Issue',
        severity: 'critical',
        sourceType: 'contract',
        sourceId: 'erd1qqqqqqqqqqqqqpgq04jn4shq6pfa7tclkfpvzt33rz30ezxhttsspkxu7c',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        status: 'new',
        description: 'Critical access control vulnerability: administrative function lacks proper authentication'
      }
    ]);
    
    // Mock transactions data (structure needs to match TransactionsList component)
    setRecentTransactions([
      {
        hash: 'c9e58f7494df4457105ed98eb6521020bc2a2a4147c9d8079d467e6affba8500',
        sender: 'erd1x82qqdj7hgnpuygzc4dj0apzqra4t8j87w07jspkhp9tg83n77yszflytz',
        receiver: 'erd1qqqqqqqqqqqqqpgq2tmhtzh8yvmzst46u5zk4amwgtr7xyf0httsmm2twr',
        value: '150000000000000000000', // 150 EGLD
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        status: 'successful',
        gasUsed: '12500000',
        gasPrice: '1000000000',
        fee: '12500000000000000',
        function: 'swapTokens',
        riskScore: 65,
        hasAlerts: true
      },
      {
        hash: 'a1b43def21c8f7b96e573d2590f52b4c7a9182c5d39a8d14b39b4e9819eabd22',
        sender: 'erd1rt5zwmhzkrr9medawycjvvngl448jnzjsp44gxul3hfdp55h57tq69tcqj',
        receiver: 'erd1qqqqqqqqqqqqqpgq04jn4shq6pfa7tclkfpvzt33rz30ezxhttsspkxu7c',
        value: '50000000000000000000', // 50 EGLD
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        status: 'successful',
        gasUsed: '7500000',
        gasPrice: '1000000000',
        fee: '7500000000000000',
        function: 'stake',
        riskScore: 12,
        hasAlerts: false
      }
    ]);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Sentinel Dashboard</h1>
        <p className="text-gray-600">
          Welcome to MultiversX Sentinel. Monitor your smart contracts and transactions for security vulnerabilities.
        </p>
      </div>
      
      {/* Dashboard Overview */}
      <Dashboard 
        stats={stats}  
        networkInfo={{ chainId: network.chainId }}
        userAddress={address}
      />
      
      {/* Security Score */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Security Overview</h2>
        <SecurityScore score={stats.securityScore} />
      </div>
      
      {/* Recent Contracts */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Contracts</h2>
          <a href="/contracts" className="text-blue-600 hover:text-blue-800">View all contracts</a>
        </div>
        <ContractOverview contract={recentContracts.map(contract => ({
          ...contract,
          securityScore: contract.riskScore,
          highRiskAlerts: contract.alertCount > 3 ? 1 : 0 // Example logic for highRiskAlerts
        }))} />
      </div>
      
      {/* Recent Alerts */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Alerts</h2>
          <a href="/alerts" className="text-blue-600 hover:text-blue-800">View all alerts</a>
        </div>
        <AlertsList initialAlerts={recentAlerts} />
      </div>
      
      {/* Recent Transactions */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <a href="/transactions" className="text-blue-600 hover:text-blue-800">View all transactions</a>
        </div>
        <TransactionsList initialTransactions={recentTransactions} />
      </div>
    </div>
  );
};

export default DashboardPage;
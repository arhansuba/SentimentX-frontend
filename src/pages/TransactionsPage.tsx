import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetActiveTransactionsStatus } from '@multiversx/sdk-dapp/hooks/transactions';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';

const TransactionsList = lazy(() => import('../components/Transactions/TransactionsList'));
const TransactionDetails = lazy(() => import('../components/Transactions/TransactionDetails'));

// Transaction metrics summary component
const TransactionMetrics: React.FC<{
  total: number;
  successful: number;
  failed: number;
  pending: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  withAlerts: number;
}> = ({ 
  total, 
  successful, 
  failed, 
  pending, 
  highRisk, 
  mediumRisk, 
  lowRisk, 
  withAlerts 
}) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm font-medium text-gray-500">Total Transactions</div>
      <div className="mt-1 text-2xl font-semibold">{total}</div>
      <div className="mt-2 text-xs text-gray-500">Monitored in last 30 days</div>
    </div>
    
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm font-medium text-gray-500">By Status</div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-xs font-medium text-green-800 bg-green-100 rounded-full px-2 py-1">Success</div>
          <div className="mt-1 font-semibold">{successful}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-red-800 bg-red-100 rounded-full px-2 py-1">Failed</div>
          <div className="mt-1 font-semibold">{failed}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full px-2 py-1">Pending</div>
          <div className="mt-1 font-semibold">{pending}</div>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm font-medium text-gray-500">Risk Distribution</div>
      <div className="mt-2 flex items-center">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full flex">
              <div 
                className="bg-red-500 h-full" 
                style={{ width: `${(highRisk / total) * 100}%` }}
              ></div>
              <div 
                className="bg-yellow-500 h-full" 
                style={{ width: `${(mediumRisk / total) * 100}%` }}
              ></div>
              <div 
                className="bg-green-500 h-full" 
                style={{ width: `${(lowRisk / total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="ml-4 text-xs">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
            <span>High: {highRisk}</span>
          </div>
          <div className="flex items-center mt-1">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
            <span>Medium: {mediumRisk}</span>
          </div>
          <div className="flex items-center mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            <span>Low: {lowRisk}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm font-medium text-gray-500">Security Alerts</div>
      <div className="mt-1 text-2xl font-semibold">{withAlerts}</div>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">Transactions with alerts</span>
        <span className="text-xs font-medium px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
          {Math.round((withAlerts / total) * 100)}%
        </span>
      </div>
    </div>
  </div>
);

const TransactionsPage: React.FC = () => {
  const { hash } = useParams<{ hash?: string }>();
  const navigate = useNavigate();
  const { address } = useGetAccountInfo();
  const activeTransactionsStatus = useGetActiveTransactionsStatus();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    withAlerts: 0
  });
  
  // Fetch transaction metrics when component mounts
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/transactions/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        } else {
          // For demo purposes, set mock data
          setMetrics({
            total: 1243,
            successful: 1176,
            failed: 42,
            pending: 25,
            highRisk: 37,
            mediumRisk: 115,
            lowRisk: 1091,
            withAlerts: 29
          });
        }
      } catch (error) {
        console.error('Error fetching transaction metrics:', error);
        // Set mock data for demonstration
        setMetrics({
          total: 1243,
          successful: 1176,
          failed: 42,
          pending: 25,
          highRisk: 37,
          mediumRisk: 115,
          lowRisk: 1091,
          withAlerts: 29
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);
  
  // Update metrics when active transaction status changes
  useEffect(() => {
    if (activeTransactionsStatus.pending) {
      setMetrics(prev => ({
        ...prev,
        pending: prev.pending + 1
      }));
    }
  }, [activeTransactionsStatus]);
  
  // Handler for when a transaction is selected from the list
  const handleTransactionSelect = (transaction: any) => {
    navigate(`/transactions/${transaction.hash}`);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Transaction Monitoring</h1>
        <p className="text-gray-600">
          Track and analyze transaction activity on the MultiversX blockchain for security risks and anomalies.
        </p>
      </div>
      
      {/* Show metrics summary if not viewing a specific transaction */}
      {!hash && <TransactionMetrics {...metrics} />}
      
      {/* User's Active Transactions Banner */}
      {activeTransactionsStatus.pending && !hash && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                You have {metrics.pending} pending transaction{metrics.pending !== 1 ? 's' : ''}.
              </p>
              <p className="mt-3 text-sm md:mt-0 md:ml-6">
                <button
                  onClick={() => navigate('/transactions/pending')}
                  className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
                >
                  View details <span aria-hidden="true">&rarr;</span>
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Suspense fallback={<div>Loading...</div>}>
        {/* Show either transaction details or transactions list based on whether a hash is present */}
        {hash ? (
          <TransactionDetails transactionHash={hash} />
        ) : (
          <TransactionsList onTransactionSelect={handleTransactionSelect} />
        )}
      </Suspense>
    </div>
  );
};

export default TransactionsPage;
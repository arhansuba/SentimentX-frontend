import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

interface TransactionAlert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

interface TransactionData {
  hash: string;
  sender: string;
  receiver: string;
  senderShard: number;
  receiverShard: number;
  value: string;
  fee: string;
  gasLimit: string;
  gasPrice: string;
  gasUsed: string;
  nonce: number;
  data?: string;
  decodedData?: {
    function: string;
    arguments: Array<{
      name: string;
      type: string;
      value: string;
    }>;
  };
  timestamp: string;
  status: 'pending' | 'successful' | 'failed' | 'invalid';
  blockHash: string;
  blockNonce: number;
  signature: string;
}

interface TransactionAnalysis {
  riskScore: number;
  anomalyScore?: number;
  analysisType: 'ai' | 'pattern' | 'anomaly' | 'manual';
  summary?: string;
  flaggedActions?: string[];
  riskFactors?: Array<{
    factor: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
  }>;
  relatedTransactions?: Array<{
    hash: string;
    relationship: string;
  }>;
  simulationResults?: {
    success: boolean;
    errorMessage?: string;
    gasConsumed: string;
    returnData?: string[];
    logs?: Array<{
      address: string;
      events: string[];
    }>;
  };
}

interface TransactionDetailsProps {
  initialData?: {
    transaction: TransactionData;
    analysis: TransactionAnalysis;
    alerts: TransactionAlert[];
  };
  transactionHash?: string;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ initialData, transactionHash: propHash }) => {
  const { hash: paramHash } = useParams<{ hash: string }>();
  const txHash = propHash || paramHash;
  const navigate = useNavigate();

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'analysis' | 'data'>('overview');

  useEffect(() => {
    if (!initialData && txHash) {
      fetchTransactionDetails(txHash);
    }
  }, [initialData, txHash]);

  const fetchTransactionDetails = async (hash: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch transaction data
      const response = await fetch(`/api/transactions/${hash}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction details (${response.status})`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching transaction details');
      console.error('Error fetching transaction details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TransactionData['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'successful':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'invalid':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: TransactionAlert['severity'] | string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 75) {
      return 'text-red-600';
    } else if (score >= 50) {
      return 'text-orange-600';
    } else if (score >= 25) {
      return 'text-yellow-600';
    } else {
      return 'text-green-600';
    }
  };

  const formatValue = (value: string, decimals = 18) => {
    // Convert from smallest denomination to EGLD (simple implementation)
    const numValue = parseFloat(value) / Math.pow(10, decimals);
    return numValue.toFixed(4);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const decodeTransactionData = (data?: string) => {
    if (!data) return null;
    
    try {
      // Simple base64 decoding - in a real app you might need more sophisticated decoding
      const decoded = atob(data);
      return decoded;
    } catch (e) {
      return data;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate('/transactions')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Transactions
        </button>
      </div>
    );
  }

  if (!data || !data.transaction) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-600 mb-4">Transaction not found</div>
        <button
          onClick={() => navigate('/transactions')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Transactions
        </button>
      </div>
    );
  }

  const { transaction, analysis, alerts } = data;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Transaction Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)} mr-2`}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
              {analysis?.riskScore !== undefined && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  analysis.riskScore >= 75 ? 'bg-red-100 text-red-800' :
                  analysis.riskScore >= 50 ? 'bg-orange-100 text-orange-800' :
                  analysis.riskScore >= 25 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                } mr-2`}>
                  Risk Score: {analysis.riskScore}
                </span>
              )}
              {alerts && alerts.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h1 className="text-xl font-semibold">Transaction Details</h1>
            <p className="text-gray-500 mt-1">
              <span>Hash: {transaction.hash}</span>
              <span className="mx-2">•</span>
              <span>{formatTimestamp(transaction.timestamp)}</span>
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button
              onClick={() => navigate('/transactions')}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            >
              Back to Transactions
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details
          </button>
        </nav>
      </div>
      <div>
      </div>
    </div>
  );
};

export default TransactionDetails;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Transaction {
  hash: string;
  sender: string;
  receiver: string;
  value: string;
  timestamp: string;
  status: 'pending' | 'successful' | 'failed' | 'invalid';
  gasUsed: string;
  gasPrice: string;
  fee: string;
  data?: string;
  function?: string;
  riskScore?: number;
  hasAlerts: boolean;
}

interface TransactionsListProps {
  initialTransactions?: Transaction[];
  onTransactionSelect?: (transaction: Transaction) => void;
  contractAddress?: string; // Optional: to filter transactions for a specific contract
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  initialTransactions,
  onTransactionSelect,
  contractAddress,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions || []);
  const [loading, setLoading] = useState<boolean>(!initialTransactions);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    status: string[];
    timeRange: 'all' | '1h' | '24h' | '7d' | '30d';
    minRiskScore: number | null;
    hasAlerts: boolean | null;
  }>({
    status: [],
    timeRange: 'all',
    minRiskScore: null,
    hasAlerts: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
  });

  useEffect(() => {
    if (!initialTransactions) {
      fetchTransactions();
    }
  }, [initialTransactions, filter, pagination.page, pagination.size, contractAddress]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters based on filters
      const queryParams = new URLSearchParams();

      if (contractAddress) {
        queryParams.append('contract', contractAddress);
      }

      if (filter.status.length > 0) {
        queryParams.append('status', filter.status.join(','));
      }

      if (filter.timeRange !== 'all') {
        queryParams.append('timeRange', filter.timeRange);
      }

      if (filter.minRiskScore !== null) {
        queryParams.append('minRiskScore', filter.minRiskScore.toString());
      }

      if (filter.hasAlerts !== null) {
        queryParams.append('hasAlerts', filter.hasAlerts.toString());
      }

      queryParams.append('page', pagination.page.toString());
      queryParams.append('size', pagination.size.toString());

      const response = await fetch(`/api/transactions?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    category: 'status' | 'timeRange' | 'minRiskScore' | 'hasAlerts',
    value: string | number | boolean
  ) => {
    setFilter(prev => {
      const updatedFilter = { ...prev };

      if (category === 'status') {
        const statusValue = value as string;
        if (updatedFilter.status.includes(statusValue)) {
          // Remove the value if it already exists
          updatedFilter.status = updatedFilter.status.filter(item => item !== statusValue);
        } else {
          // Add the value if it doesn't exist
          updatedFilter.status = [...updatedFilter.status, statusValue];
        }
      } else if (category === 'timeRange') {
        updatedFilter.timeRange = value as 'all' | '1h' | '24h' | '7d' | '30d';
      } else if (category === 'minRiskScore') {
        updatedFilter.minRiskScore = value as number;
      } else if (category === 'hasAlerts') {
        updatedFilter.hasAlerts = value as boolean;
      }

      return updatedFilter;
    });

    // Reset pagination when filters change
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  const handleTransactionClick = (transaction: Transaction) => {
    if (onTransactionSelect) {
      onTransactionSelect(transaction);
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
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

  const getRiskScoreBadge = (score?: number) => {
    if (score === undefined) return null;
    
    let colorClass = '';
    if (score >= 75) {
      colorClass = 'bg-red-100 text-red-800';
    } else if (score >= 50) {
      colorClass = 'bg-orange-100 text-orange-800';
    } else if (score >= 25) {
      colorClass = 'bg-yellow-100 text-yellow-800';
    } else {
      colorClass = 'bg-green-100 text-green-800';
    }

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
        Risk: {score}
      </span>
    );
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatValue = (value: string) => {
    // Convert string value to number and format with 4 decimal places
    const numValue = parseFloat(value);
    return numValue.toFixed(4);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(pagination.total / pagination.size);
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
            disabled={pagination.page === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, totalPages) }))}
            disabled={pagination.page === totalPages || totalPages === 0}
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{transactions.length > 0 ? (pagination.page - 1) * pagination.size + 1 : 0}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.size, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> results
            </p>
          </div>
          <div>
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                &larr;
              </button>
              {/* Page numbers here if needed */}
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                {pagination.page} / {totalPages || 1}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, totalPages) }))}
                disabled={pagination.page === totalPages || totalPages === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                &rarr;
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filter Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4">
          {/* Status Filters */}
          <div>
            <h3 className="text-sm font-medium mb-2">Status</h3>
            <div className="flex flex-wrap gap-2">
              {['pending', 'successful', 'failed', 'invalid'].map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange('status', status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter.status.includes(status)
                      ? getStatusColor(status as Transaction['status'])
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Time Range</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Time' },
                { value: '1h', label: 'Last Hour' },
                { value: '24h', label: 'Last 24 Hours' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('timeRange', option.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter.timeRange === option.value
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Score Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Risk Score</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { value: null, label: 'Any' },
                { value: 25, label: '> 25' },
                { value: 50, label: '> 50' },
                { value: 75, label: '> 75' },
              ].map(option => (
                <button
                  key={option.label}
                  onClick={() => handleFilterChange('minRiskScore', option.value as number)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter.minRiskScore === option.value
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Has Alerts Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Security Alerts</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { value: null, label: 'Any' },
                { value: true, label: 'With Alerts' },
                { value: false, label: 'No Alerts' },
              ].map(option => (
                <button
                  key={option.label}
                  onClick={() => handleFilterChange('hasAlerts', option.value as boolean)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter.hasAlerts === option.value
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="ml-auto self-end">
            <button
              onClick={fetchTransactions}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No transactions found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hash
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From / To
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Function
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map(transaction => (
                  <tr
                    key={transaction.hash}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        <Link to={`/transactions/${transaction.hash}`} onClick={(e) => e.stopPropagation()}>
                          {transaction.hash.substring(0, 8)}...{transaction.hash.substring(transaction.hash.length - 6)}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">From:</span> {formatAddress(transaction.sender)}
                        </div>
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">To:</span> {formatAddress(transaction.receiver)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatValue(transaction.value)} EGLD</div>
                      <div className="text-xs text-gray-500">Fee: {formatValue(transaction.fee)} EGLD</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.function || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        {getRiskScoreBadge(transaction.riskScore)}
                        {transaction.hasAlerts && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Alert
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && renderPagination()}
    </div>
  );
};

export default TransactionsList;
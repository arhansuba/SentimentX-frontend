import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Alert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  sourceType: 'contract' | 'transaction';
  sourceId: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved' | 'false_positive';
  description: string;
}

interface AlertsListProps {
  initialAlerts?: Alert[];
  onAlertSelect?: (alert: Alert) => void;
}

const AlertsList: React.FC<AlertsListProps> = ({ 
  initialAlerts,
  onAlertSelect
}) => {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts || []);
  const [loading, setLoading] = useState<boolean>(!initialAlerts);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    severity: string[];
    sourceType: string[];
    status: string[];
  }>({
    severity: [],
    sourceType: [],
    status: []
  });

  useEffect(() => {
    if (!initialAlerts) {
      fetchAlerts();
    }
  }, [initialAlerts]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters based on filters
      const queryParams = new URLSearchParams();
      
      if (filter.severity.length > 0) {
        queryParams.append('severity', filter.severity.join(','));
      }
      
      if (filter.sourceType.length > 0) {
        queryParams.append('sourceType', filter.sourceType.join(','));
      }
      
      if (filter.status.length > 0) {
        queryParams.append('status', filter.status.join(','));
      }
      
      const response = await fetch(`/api/alerts?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      
      const data = await response.json();
      setAlerts(data.alerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (category: 'severity' | 'sourceType' | 'status', value: string) => {
    setFilter(prev => {
      const updatedFilter = { ...prev };
      
      if (updatedFilter[category].includes(value)) {
        // Remove the value if it already exists
        updatedFilter[category] = updatedFilter[category].filter(item => item !== value);
      } else {
        // Add the value if it doesn't exist
        updatedFilter[category] = [...updatedFilter[category], value];
      }
      
      return updatedFilter;
    });
  };

  const handleAlertClick = (alert: Alert) => {
    if (onAlertSelect) {
      onAlertSelect(alert);
    }
  };

  const updateAlertStatus = async (alertId: string, newStatus: Alert['status']) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update alert status');
      }
      
      // Update the alert in the local state
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, status: newStatus } : alert
        )
      );
    } catch (err) {
      console.error('Error updating alert status:', err);
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
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

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'acknowledged':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'false_positive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filter Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4">
          {/* Severity Filters */}
          <div>
            <h3 className="text-sm font-medium mb-2">Severity</h3>
            <div className="flex flex-wrap gap-2">
              {['critical', 'high', 'medium', 'low'].map(severity => (
                <button
                  key={severity}
                  onClick={() => handleFilterChange('severity', severity)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter.severity.includes(severity)
                      ? getSeverityColor(severity as Alert['severity'])
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Source Type Filters */}
          <div>
            <h3 className="text-sm font-medium mb-2">Source</h3>
            <div className="flex flex-wrap gap-2">
              {['contract', 'transaction'].map(sourceType => (
                <button
                  key={sourceType}
                  onClick={() => handleFilterChange('sourceType', sourceType)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter.sourceType.includes(sourceType)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {sourceType.charAt(0).toUpperCase() + sourceType.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Status Filters */}
          <div>
            <h3 className="text-sm font-medium mb-2">Status</h3>
            <div className="flex flex-wrap gap-2">
              {['new', 'acknowledged', 'resolved', 'false_positive'].map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange('status', status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filter.status.includes(status)
                      ? getStatusColor(status as Alert['status'])
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {status.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </button>
              ))}
            </div>
          </div>
          
          {/* Apply Filters Button */}
          <div className="ml-auto self-end">
            <button
              onClick={fetchAlerts}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Alerts List */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-600">
            {error}
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No alerts found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alert
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map(alert => (
                  <tr 
                    key={alert.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAlertClick(alert)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{alert.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.sourceType.charAt(0).toUpperCase() + alert.sourceType.slice(1)}</div>
                      <div className="text-sm text-gray-500">
                        <Link 
                          to={`/${alert.sourceType}s/${alert.sourceId}`}
                          className="text-blue-600 hover:text-blue-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {alert.sourceId.substring(0, 8)}...
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        {alert.status === 'new' && (
                          <button
                            onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Acknowledge
                          </button>
                        )}
                        {(alert.status === 'new' || alert.status === 'acknowledged') && (
                          <button
                            onClick={() => updateAlertStatus(alert.id, 'resolved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Resolve
                          </button>
                        )}
                        {alert.status !== 'false_positive' && (
                          <button
                            onClick={() => updateAlertStatus(alert.id, 'false_positive')}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            False Positive
                          </button>
                        )}
                        <Link 
                          to={`/alerts/${alert.id}`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsList;
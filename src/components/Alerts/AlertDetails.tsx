import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

interface Vulnerability {
  type: string;
  risk_level: string;
  explanation: string;
  recommendation: string;
  location?: string;
}

interface Alert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  sourceType: 'contract' | 'transaction';
  sourceId: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved' | 'false_positive';
  description: string;
  details: {
    vulnerability?: Vulnerability;
    anomalyScore?: number;
    flowTrace?: string[];
    impactedAddresses?: string[];
    relatedAlerts?: string[];
    rawData?: string;
    detectionMethod: 'ai' | 'pattern' | 'anomaly' | 'manual';
  };
  timeline: {
    timestamp: string;
    action: string;
    user?: string;
    details?: string;
  }[];
}

interface AlertDetailsProps {
  initialAlert?: Alert;
  alertId?: string;
}

const AlertDetails: React.FC<AlertDetailsProps> = ({ initialAlert, alertId: propAlertId }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const alertId = propAlertId || paramId;
  const navigate = useNavigate();
  
  const [alert, setAlert] = useState<Alert | null>(initialAlert || null);
  const [loading, setLoading] = useState<boolean>(!initialAlert);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('');
  
  useEffect(() => {
    if (!initialAlert && alertId) {
      fetchAlertDetails(alertId);
    }
  }, [initialAlert, alertId]);

  const fetchAlertDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/alerts/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch alert details');
      }
      
      const data = await response.json();
      setAlert(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching alert details');
      console.error('Error fetching alert details:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (newStatus: Alert['status']) => {
    if (!alert) return;
    
    try {
      const response = await fetch(`/api/alerts/${alert.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          comment: comment.trim() ? comment : undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update alert status');
      }
      
      const updatedAlert = await response.json();
      setAlert(updatedAlert);
      setComment('');
    } catch (err) {
      console.error('Error updating alert status:', err);
    }
  };

  const addComment = async () => {
    if (!alert || !comment.trim()) return;
    
    try {
      const response = await fetch(`/api/alerts/${alert.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const updatedAlert = await response.json();
      setAlert(updatedAlert);
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
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

  const getDetectionMethodLabel = (method: string) => {
    switch (method) {
      case 'ai':
        return 'AI Analysis';
      case 'pattern':
        return 'Pattern Detection';
      case 'anomaly':
        return 'Anomaly Detection';
      case 'manual':
        return 'Manual Detection';
      default:
        return method;
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
          onClick={() => navigate('/alerts')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Alerts
        </button>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-600 mb-4">Alert not found</div>
        <button
          onClick={() => navigate('/alerts')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Alerts
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Alert Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)} mr-2`}>
                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                {alert.status.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
            </div>
            <h1 className="text-xl font-semibold">{alert.title}</h1>
            <p className="text-gray-500 mt-1">
              <span>Detected on {new Date(alert.timestamp).toLocaleString()}</span>
              <span className="mx-2">•</span>
              <span>
                <span>Source: </span>
                <Link 
                  to={`/${alert.sourceType}s/${alert.sourceId}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {alert.sourceType.charAt(0).toUpperCase() + alert.sourceType.slice(1)} {alert.sourceId.substring(0, 8)}...
                </Link>
              </span>
            </p>
          </div>
          <div className="flex space-x-2">
            {alert.status === 'new' && (
              <button
                onClick={() => updateAlertStatus('acknowledged')}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Acknowledge
              </button>
            )}
            {(alert.status === 'new' || alert.status === 'acknowledged') && (
              <button
                onClick={() => updateAlertStatus('resolved')}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Resolve
              </button>
            )}
            {alert.status !== 'false_positive' && (
              <button
                onClick={() => updateAlertStatus('false_positive')}
                className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Mark as False Positive
              </button>
            )}
            <button
              onClick={() => navigate('/alerts')}
              className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
            >
              Back to Alerts
            </button>
          </div>
        </div>
      </div>
      
      {/* Alert Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Alert Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{alert.description}</p>
          </div>
          
          {/* Vulnerability Details */}
          {alert.details.vulnerability && (
            <div>
              <h2 className="text-lg font-medium mb-2">Vulnerability Details</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="mb-3">
                  <span className="font-medium">Type:</span> {alert.details.vulnerability.type}
                </div>
                <div className="mb-3">
                  <span className="font-medium">Risk Level:</span> 
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.details.vulnerability.risk_level as Alert['severity'])}`}>
                    {alert.details.vulnerability.risk_level.charAt(0).toUpperCase() + alert.details.vulnerability.risk_level.slice(1)}
                  </span>
                </div>
                <div className="mb-3">
                  <span className="font-medium">Explanation:</span>
                  <p className="mt-1 text-gray-700">{alert.details.vulnerability.explanation}</p>
                </div>
                {alert.details.vulnerability.location && (
                  <div className="mb-3">
                    <span className="font-medium">Location:</span>
                    <p className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded">{alert.details.vulnerability.location}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">Recommendation:</span>
                  <p className="mt-1 text-gray-700">{alert.details.vulnerability.recommendation}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Flow Trace */}
          {alert.details.flowTrace && alert.details.flowTrace.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-2">Execution Flow</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <ol className="list-decimal list-inside space-y-2">
                  {alert.details.flowTrace.map((step, index) => (
                    <li key={index} className="text-gray-700">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
          
          {/* Raw Data (if available) */}
          {alert.details.rawData && (
            <div>
              <h2 className="text-lg font-medium mb-2">Raw Data</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="font-mono text-sm whitespace-pre-wrap break-all">
                  {alert.details.rawData}
                </pre>
              </div>
            </div>
          )}
          
          {/* Timeline */}
          <div>
            <h2 className="text-lg font-medium mb-2">Timeline</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <ol className="relative border-l border-gray-300 ml-3 space-y-6">
                {alert.timeline.map((event, index) => (
                  <li key={index} className="ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-gray-50">
                      <svg className="w-3 h-3 text-blue-800" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                      </svg>
                    </span>
                    <div className="p-3 bg-white shadow-sm rounded-md border border-gray-200">
                      <time className="block text-xs font-normal text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </time>
                      <h3 className="flex items-center text-base font-medium text-gray-900 mt-1">
                        {event.action}
                        {event.user && (
                          <span className="text-xs font-normal text-gray-500 ml-2">
                            by {event.user}
                          </span>
                        )}
                      </h3>
                      {event.details && (
                        <p className="text-sm font-normal text-gray-700 mt-1">
                          {event.details}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          {/* Add Comment */}
          <div>
            <h2 className="text-lg font-medium mb-2">Add Comment</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button onClick={addComment} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Add Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetails;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AlertsList from '../components/Alerts/AlertsList';
import AlertDetails from '../components/Alerts/AlertDetails';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/account';
//import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/accounts';

// Dashboard stats summary component
const AlertsMetrics: React.FC<{
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  new: number;
  acknowledged: number;
  resolved: number;
}> = ({ total, critical, high, medium, low, new: newAlerts, acknowledged, resolved }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm font-medium text-gray-500">Total Alerts</div>
      <div className="mt-1 text-2xl font-semibold">{total}</div>
    </div>
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm font-medium text-gray-500">By Severity</div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        <div className="text-center">
          <div className="text-xs font-medium text-red-800 bg-red-100 rounded-full px-2 py-1">Critical</div>
          <div className="mt-1 font-semibold">{critical}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-orange-800 bg-orange-100 rounded-full px-2 py-1">High</div>
          <div className="mt-1 font-semibold">{high}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full px-2 py-1">Medium</div>
          <div className="mt-1 font-semibold">{medium}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-green-800 bg-green-100 rounded-full px-2 py-1">Low</div>
          <div className="mt-1 font-semibold">{low}</div>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm font-medium text-gray-500">By Status</div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-xs font-medium text-blue-800 bg-blue-100 rounded-full px-2 py-1">New</div>
          <div className="mt-1 font-semibold">{newAlerts}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-purple-800 bg-purple-100 rounded-full px-2 py-1">Acknowledged</div>
          <div className="mt-1 font-semibold">{acknowledged}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-green-800 bg-green-100 rounded-full px-2 py-1">Resolved</div>
          <div className="mt-1 font-semibold">{resolved}</div>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm font-medium text-gray-500">Alert Trend (Last 7 days)</div>
      <div className="h-12 mt-2 flex items-end space-x-1">
        {[4, 7, 5, 9, 12, 8, 10].map((value, index) => (
          <div 
            key={index}
            className="flex-1 bg-blue-500 rounded-t"
            style={{ height: `${(value / 15) * 100}%` }}
          ></div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>7d ago</span>
        <span>Today</span>
      </div>
    </div>
  </div>  
);

const AlertsPage: React.FC = () => {
  const { alertId } = useParams<{ alertId?: string }>();
  const navigate = useNavigate();
  useGetAccountInfo();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    new: 0,
    acknowledged: 0,
    resolved: 0
  });
  
  // Fetch alerts metrics when component mounts
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/alerts/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        } else {
          // For demo purposes, set mock data
          setMetrics({
            total: 37,
            critical: 3,
            high: 8,
            medium: 15,
            low: 11,
            new: 14,
            acknowledged: 9,
            resolved: 14
          });
        }
      } catch (error) {
        console.error('Error fetching alert metrics:', error);
        // Set mock data for demonstration
        setMetrics({
          total: 37,
          critical: 3,
          high: 8,
          medium: 15,
          low: 11,
          new: 14,
          acknowledged: 9,
          resolved: 14
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);
  
  // Handler for when an alert is selected from the list
  const handleAlertSelect = (alert: any) => {
    navigate(`/alerts/${alert.id}`);
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
        <h1 className="text-2xl font-bold mb-2">Security Alerts</h1>
        <p className="text-gray-600">
          Monitor and manage security alerts for your MultiversX smart contracts and transactions.
        </p>
      </div>
      
      {/* Show metrics summary if not viewing a specific alert */}
      {!alertId && <AlertsMetrics {...metrics} />}
      
      {/* Show either alert details or alerts list based on whether an alertId is present */}
      {alertId ? (
        <AlertDetails alertId={alertId} />
      ) : (
        <AlertsList onAlertSelect={handleAlertSelect} />
      )}
    </div>
  );
};

export default AlertsPage;
import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from '../components/Dashboard/Dashboard';
import { Card } from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Alert } from '@mui/material';
import { fetchDashboardData as fetchDashboardDataFromService } from '../services/fetchProxy';

const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    contractsMonitored: 0,
    contractsAtRisk: 0,
    activeAlerts: 0,
    resolvedAlerts: 0,
    transactionsMonitored: 0,
    anomaliesDetected: 0,
    securityScore: 0,
  });
  const [networkInfo, setNetworkInfo] = useState({ chainId: 'D' });

  // Use our new fetchDashboardData function that has the correct endpoints
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use our fetch proxy service with correct endpoints
      const result = await fetchDashboardDataFromService();
      setStats(result.stats);
      setNetworkInfo(result.networkInfo);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
      
      // Fallback data for when API fails
      setStats({
        contractsMonitored: 3,
        contractsAtRisk: 2,
        activeAlerts: 42,
        resolvedAlerts: 45,
        transactionsMonitored: 1243,
        anomaliesDetected: 29,
        securityScore: 75,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" message="Loading dashboard data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 mx-auto my-12 max-w-2xl">
        <Alert 
          severity="error" 
          className="mb-6"
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
        
        <div className="text-center mt-4">
          <p className="mb-4 text-gray-700">
            We encountered an error loading the dashboard data.
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            onClick={() => loadDashboard()}
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <Dashboard
        stats={stats}
        networkInfo={networkInfo}
      />
    </div>
  );
};

export default DashboardPage;
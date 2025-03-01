// hooks/useAlerts.ts
import { useEffect, useState, useCallback } from 'react';
import { useSentinelContext } from '../context/SentinelContext';

import { AlertType, AlertListResponse } from '../types/alert'; // Ensure AlertListResponse is imported
import alertService from '@/services/alertService';

export const useAlerts = () => {
  const { state, dispatch } = useSentinelContext();
  const { alerts, loading, error } = state;

  const fetchAlerts = useCallback(async () => {
    try {
      dispatch({ type: 'SET_ALERTS_LOADING', payload: true });
      dispatch({ type: 'SET_ALERTS_ERROR', payload: null });
      
      const data: AlertListResponse = await alertService.getAlerts(); // Ensure the correct type is used
      dispatch({ type: 'SET_ALERTS', payload: data.alerts }); // Ensure payload matches expected type
    } catch (err) {
      dispatch({ 
        type: 'SET_ALERTS_ERROR', 
        payload: err instanceof Error ? err.message : 'Unknown error fetching alerts' 
      });
    } finally {
      dispatch({ type: 'SET_ALERTS_LOADING', payload: false });
    }
  }, [dispatch]);

  const getAlertById = useCallback((id: string) => {
    return alerts.find(alert => alert.id === id);
  }, [alerts]);

  const getAlertsByContractId = useCallback((contractId: string) => {
    return alerts.filter(alert => alert.contractId === contractId);
  }, [alerts]);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      dispatch({ type: 'SET_ALERTS_LOADING', payload: true });
      
      await alertService.resolveAlert(alertId); // Ensure resolveAlert method exists in alertService
      
      // Update the alerts list
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, status: 'resolved' as 'resolved' } : alert
      );
      
      dispatch({ type: 'SET_ALERTS', payload: updatedAlerts });
    } catch (err) {
      dispatch({ 
        type: 'SET_ALERTS_ERROR', 
        payload: err instanceof Error ? err.message : 'Unknown error resolving alert' 
      });
      throw err;
    } finally {
      dispatch({ type: 'SET_ALERTS_LOADING', payload: false });
    }
  }, [alerts, dispatch]);

  useEffect(() => {
    fetchAlerts();
    
    // Set up polling for new alerts
    const pollInterval = setInterval(() => {
      fetchAlerts();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(pollInterval);
  }, [fetchAlerts]);

  return {
    alerts,
    loading: loading.alerts,
    error: error.alerts,
    fetchAlerts,
    getAlertById,
    getAlertsByContractId,
    resolveAlert
  };
};
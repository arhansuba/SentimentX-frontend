import api from './api';
import { getIsLoggedIn } from '@multiversx/sdk-dapp/utils';
import { AlertType } from '../types/alert'; // Import AlertType

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertSourceType = 'contract' | 'transaction';
export type AlertStatus = 'new' | 'acknowledged' | 'resolved' | 'false_positive';

export interface Alert extends AlertType { // Extend AlertType
  details?: {
    vulnerability?: {
      type: string;
      risk_level: string;
      explanation: string;
      recommendation: string;
      location?: string;
    };
    anomalyScore?: number;
    flowTrace?: string[];
    impactedAddresses?: string[];
    relatedAlerts?: string[];
    rawData?: string;
    detectionMethod: 'ai' | 'pattern' | 'anomaly' | 'manual';
  };
  timeline?: {
    timestamp: string;
    action: string;
    user?: string;
    details?: string;
  }[];
}

export interface AlertComment {
  id: string;
  alertId: string;
  timestamp: string;
  user: string;
  content: string;
}

export interface AlertListParams {
  page?: number;
  size?: number;
  severity?: AlertSeverity[];
  sourceType?: AlertSourceType[];
  status?: AlertStatus[];
  startDate?: string;
  endDate?: string;
  contractAddress?: string;
  sortBy?: 'timestamp' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

export interface AlertListResponse {
  alerts: Alert[];
  total: number;
  page: number;
  size: number;
}

export interface AlertMetrics {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  new: number;
  acknowledged: number;
  resolved: number;
  false_positive: number;
  byTimeRange: {
    date: string;
    count: number;
  }[];
  byContract: {
    address: string;
    name?: string;
    count: number;
  }[];
}

/**
 * AlertService provides methods to interact with security alerts data
 */
class AlertService {
  /**
   * Get a list of security alerts
   */
  public async getAlerts(params: AlertListParams = {}): Promise<AlertListResponse> {
    try {
      return await api.get('/alerts', { params });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  /**
   * Get alert details by ID
   */
  public async getAlertDetails(id: string): Promise<Alert> {
    try {
      return await api.get(`/alerts/${id}`);
    } catch (error) {
      console.error(`Error fetching alert details for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update alert status
   */
  public async updateAlertStatus(id: string, status: AlertStatus, comment?: string): Promise<Alert> {
    try {
      // This endpoint requires authentication
      if (!getIsLoggedIn()) {
        throw new Error('Authentication required to update alert status');
      }

      return await api.put(`/alerts/${id}/status`, { status, comment });
    } catch (error) {
      console.error(`Error updating status for alert ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add a comment to an alert
   */
  public async addComment(id: string, content: string): Promise<AlertComment> {
    try {
      // This endpoint requires authentication
      if (!getIsLoggedIn()) {
        throw new Error('Authentication required to add comments');
      }

      return await api.post(`/alerts/${id}/comments`, { content });
    } catch (error) {
      console.error(`Error adding comment to alert ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get comments for an alert
   */
  public async getComments(id: string): Promise<AlertComment[]> {
    try {
      return await api.get(`/alerts/${id}/comments`);
    } catch (error) {
      console.error(`Error fetching comments for alert ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get alert metrics
   */
  public async getAlertMetrics(timeRange?: 'day' | 'week' | 'month' | 'year'): Promise<AlertMetrics> {
    try {
      return await api.get('/alerts/metrics', {
        params: timeRange ? { timeRange } : undefined
      });
    } catch (error) {
      console.error('Error fetching alert metrics:', error);
      throw error;
    }
  }

  /**
   * Get alerts related to a specific contract
   */
  public async getContractAlerts(address: string, params: AlertListParams = {}): Promise<AlertListResponse> {
    try {
      return await api.get(`/contracts/${address}/alerts`, { params });
    } catch (error) {
      console.error(`Error fetching alerts for contract ${address}:`, error);
      throw error;
    }
  }

  /**
   * Get alerts related to a specific transaction
   */
  public async getTransactionAlerts(hash: string): Promise<Alert[]> {
    try {
      return await api.get(`/transactions/${hash}/alerts`);
    } catch (error) {
      console.error(`Error fetching alerts for transaction ${hash}:`, error);
      throw error;
    }
  }

  /**
   * Manually create a new alert (for admin or advanced users)
   */
  public async createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'timeline'>): Promise<Alert> {
    try {
      // This endpoint requires authentication
      if (!getIsLoggedIn()) {
        throw new Error('Authentication required to create alerts');
      }

      return await api.post('/alerts', alertData);
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Mark multiple alerts as resolved
   */
  public async bulkResolve(ids: string[]): Promise<{ succeeded: string[], failed: string[] }> {
    try {
      // This endpoint requires authentication
      if (!getIsLoggedIn()) {
        throw new Error('Authentication required to bulk resolve alerts');
      }

      return await api.post('/alerts/bulk-resolve', { ids });
    } catch (error) {
      console.error('Error bulk resolving alerts:', error);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  public async resolveAlert(alertId: string): Promise<void> {
    try {
      // This endpoint requires authentication
      if (!getIsLoggedIn()) {
        throw new Error('Authentication required to resolve alert');
      }

      await api.post(`/alerts/${alertId}/resolve`);
    } catch (error) {
      console.error(`Error resolving alert ${alertId}:`, error);
      throw error;
    }
  }
}

export default new AlertService();
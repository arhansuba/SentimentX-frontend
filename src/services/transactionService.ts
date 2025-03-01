import api from './api';
import { getIsLoggedIn } from '@multiversx/sdk-dapp/utils';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { TransactionPayload } from '@multiversx/sdk-core/out';

export type TransactionStatus = 'pending' | 'successful' | 'failed' | 'invalid';

export interface Transaction {
  type: any;
  severity: any;
  title: any;
  description: any;
  analysis: any; 
  hash: string;
  sender: string;
  receiver: string;
  senderShard?: number;
  receiverShard?: number;
  value: string;
  fee: string;
  gasLimit?: string;
  gasPrice?: string;
  gasUsed?: string;
  nonce?: number;
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
  status: TransactionStatus;
  blockHash?: string;
  blockNonce?: number;
  signature?: string;
}

export interface TransactionAnalysis {
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

export interface TransactionAlert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export interface TransactionWithAnalysis {
  transaction: Transaction;
  analysis: TransactionAnalysis;
  alerts: TransactionAlert[];
}

export interface TransactionListParams {
  page?: number;
  size?: number;
  status?: TransactionStatus[];
  timeRange?: 'all' | '1h' | '24h' | '7d' | '30d';
  minRiskScore?: number;
  hasAlerts?: boolean;
  contract?: string;
  sender?: string;
  receiver?: string;
  minValue?: string;
  maxValue?: string;
  function?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  size: number;
}

export interface TransactionMetrics {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  withAlerts: number;
}

/**
 * TransactionService provides methods to interact with transaction data
 */
class TransactionService {
  /**
   * Get a list of monitored transactions
   */
  public async getTransactions(params: TransactionListParams = {}): Promise<TransactionListResponse> {
    try {
      return await api.get('/transactions', { params });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction details with analysis and alerts
   */
  public async getTransactionDetails(hash: string): Promise<TransactionWithAnalysis> {
    try {
      return await api.get(`/transactions/${hash}`);
    } catch (error) {
      console.error(`Error fetching transaction details for ${hash}:`, error);
      throw error;
    }
  }

  /**
   * Send a transaction and add it to monitoring
   */
  public async sendAndMonitorTransaction(
    transaction: {
      value: string;
      data?: string;
      receiver: string;
      gasLimit?: number;
    },
    options?: {
      callbackRoute?: string;
      minGasLimit?: number;
    }
  ): Promise<{ sessionId: string; hash?: string }> {
    try {
      // This endpoint requires authentication
      if (!getIsLoggedIn()) {
        throw new Error('Authentication required to send transactions');
      }

      // Use MultiversX SDK to send the transaction
      const result = await sendTransactions({
        transactions: [transaction],
        callbackRoute: options?.callbackRoute,
        minGasLimit: options?.minGasLimit,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Add transaction to monitoring
      if (result.sessionId) {
        await this.addTransactionToMonitoring(result.sessionId);
      }

      return { sessionId: result.sessionId || '' };
    } catch (error) {
      console.error('Error sending and monitoring transaction:', error);
      throw error;
    }
  }

  /**
   * Add a transaction to monitoring
   */
  public async addTransactionToMonitoring(hashOrSessionId: string): Promise<void> {
    try {
      // This endpoint requires authentication
      if (!getIsLoggedIn()) {
        throw new Error('Authentication required to add transactions to monitoring');
      }

      await api.post('/transactions/monitor', { identifier: hashOrSessionId });
    } catch (error) {
      console.error(`Error adding transaction ${hashOrSessionId} to monitoring:`, error);
      throw error;
    }
  }

  /**
   * Get transaction metrics
   */
  public async getTransactionMetrics(timeRange?: 'day' | 'week' | 'month' | 'year'): Promise<TransactionMetrics> {
    try {
      return await api.get('/transactions/metrics', {
        params: timeRange ? { timeRange } : undefined
      });
    } catch (error) {
      console.error('Error fetching transaction metrics:', error);
      throw error;
    }
  }

  /**
   * Get pending transactions
   */
  public async getPendingTransactions(): Promise<Transaction[]> {
    try {
      return await api.get('/transactions/pending');
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      throw error;
    }
  }

  /**
   * Get transactions for a specific contract
   */
  public async getContractTransactions(
    address: string, 
    params: TransactionListParams = {}
  ): Promise<TransactionListResponse> {
    try {
      return await api.get(`/contracts/${address}/transactions`, { params });
    } catch (error) {
      console.error(`Error fetching transactions for contract ${address}:`, error);
      throw error;
    }
  }

  /**
   * Request transaction simulation
   */
  public async simulateTransaction(
    transaction: {
      sender: string;
      receiver: string;
      value: string;
      data?: string;
      gasLimit?: number;
    }
  ): Promise<TransactionAnalysis['simulationResults']> {
    try {
      // Encode transaction data if needed
      let data = transaction.data;
      if (data && !data.startsWith('0x') && !this.isBase64(data)) {
        data = new TransactionPayload(data).toString();
      }

      return await api.post('/transactions/simulate', {
        ...transaction,
        data
      });
    } catch (error) {
      console.error('Error simulating transaction:', error);
      throw error;
    }
  }

  /**
   * Run security analysis on transaction
   */
  public async analyzeTransaction(hash: string): Promise<{ taskId: string }> {
    try {
      // This endpoint requires authentication
      if (!getIsLoggedIn()) {
        throw new Error('Authentication required to analyze transactions');
      }

      return await api.post(`/transactions/${hash}/analyze`);
    } catch (error) {
      console.error(`Error requesting analysis for transaction ${hash}:`, error);
      throw error;
    }
  }

  /**
   * Check if a string is base64 encoded
   */
  private isBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new TransactionService();
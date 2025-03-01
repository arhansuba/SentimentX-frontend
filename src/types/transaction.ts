// types/transaction.ts
import { BigNumber } from 'bignumber.js';
import { AlertType } from './alert';

export interface TransactionType extends AlertType {
  id: string;
  hash: string;
  contractId?: string;
  contractAddress: string;
  sender: string;
  senderName?: string;
  value: string; // BigNumber as string
  gasLimit: number;
  gasPrice: number;
  gasUsed: number;
  fee: string; // BigNumber as string
  timestamp: Date;
  status: 'pending' | 'success' | 'failed' | 'invalid';
  data?: string;
  results?: TransactionResult[];
  function?: string;
  args?: any[];
  nonce: number;
  riskScore: number; // 0-100
  anomalyDetection: {
    isAnomaly: boolean;
    confidence: number;
    anomalyType?: string;
    description?: string;
  };
  tokens?: TokenTransfer[];
}

export interface TransactionResult {
  id: string;
  transactionId: string;
  contractAddress: string;
  data: string;
  returnCode: string;
  returnMessage: string;
  gasUsed: number;
  value: string; // BigNumber as string
  sender: string;
  receiver: string;
  logs?: TransactionLog[];
}

export interface TransactionLog {
  id: string;
  event: string;
  topics: string[];
  data: string;
  address: string;
}

export interface TokenTransfer {
  token: string;
  tokenName?: string;
  tokenDecimals?: number;
  value: string; // BigNumber as string
  from: string;
  to: string;
  nonce?: number;
}

export interface TransactionFilter {
  contractId?: string;
  contractAddress?: string;
  sender?: string;
  status?: string;
  function?: string;
  minValue?: string;
  maxValue?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  isAnomaly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'timestamp' | 'value' | 'gasUsed' | 'riskScore';
  sortDirection?: 'asc' | 'desc';
}

export interface TransactionPattern {
  id: string;
  contractId: string;
  type: string;
  description: string;
  frequency: number;
  avgValue: string; // BigNumber as string
  relatedTransactions: string[]; // Array of transaction hashes
  firstSeen: Date;
  lastSeen: Date;
  senders: string[];
  riskAssessment: {
    score: number;
    explanation: string;
  };
}

export interface TransactionAnalytics {
  totalCount: number;
  successRate: number;
  avgGasUsed: number;
  totalValue: string; // BigNumber as string
  peakTps: number; // Transactions per second
  uniqueAddresses: number;
  mostCalledFunctions: {
    name: string;
    count: number;
  }[];
  valueDistribution: {
    range: string;
    count: number;
  }[];
  timeDistribution: {
    timeFrame: string;
    count: number;
  }[];
}
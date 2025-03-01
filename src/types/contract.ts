// types/contract.ts
export interface ContractType {
  address: string;
  name: string;
  type: string;
  deploymentTransaction: string;
  creator: string;
  creationDate: Date;
  lastActivityDate: Date;
  riskScore: number;
  anomalyDetection: {
    isAnomaly: boolean;
    confidence: number;
    anomalyType?: string;
    description?: string;
  };
  transactions: string[]; // Array of transaction hashes
}

export interface Vulnerability {
  id: string;
  contractId: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  locationInfo?: {
    line?: number;
    function?: string;
    file?: string;
  };
  detectedAt: Date;
  status: 'open' | 'resolved' | 'false-positive';
  remediation?: string;
}

export interface ContractMetrics {
  transactionCount: number;
  uniqueUsers: number;
  totalValue: string; // BigNumber as string
  dailyActiveUsers: number;
  averageGasUsed: number;
  failedTransactionsRate: number;
}

export interface ContractAnalysis {
  patternDetection: {
    reentrancyRisk: boolean;
    flashLoanVulnerability: boolean;
    overflowUnderflowRisk: boolean;
    accessControlIssues: boolean;
  };
  codeQualityScore: number;
  permissions: {
    hasOwnerOnlyFunctions: boolean;
    isPausable: boolean;
    hasUpgradeability: boolean;
    hasEmergencyWithdraw: boolean;
  };
  securityAuditInfo?: {
    auditedBy?: string;
    auditDate?: Date;
    auditReport?: string;
  };
}

export interface ContractFilter {
  search?: string;
  type?: string;
  securityScoreMin?: number;
  securityScoreMax?: number;
  sortBy?: 'name' | 'createdAt' | 'securityScore' | 'transactionCount';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ContractListResponse {
  contracts: ContractType[];
}
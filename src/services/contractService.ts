import api from './api';
import { Address } from '@multiversx/sdk-core/out';
import { getIsLoggedIn } from '@multiversx/sdk-dapp/utils';
import { ContractAnalysis, ContractMetrics, ContractType, Vulnerability, ContractListResponse } from '../types/contract';


export interface Contract {
  id: string;
  address: string;
  name: string;
  description?: string;
  type: 'token' | 'nft' | 'defi' | 'dao' | 'generic';
  deploymentTransaction: string;
  owner: string;
  createdAt: Date;
  lastUpdated: Date;
  securityScore: number;
  vulnerabilities: Vulnerability[];
  metrics: ContractMetrics;
  analysis: ContractAnalysis;
  sourceCode?: string;
  abi?: Record<string, any>;
  isVerified: boolean;
}

export interface ContractVulnerability {
  type: string;
  risk_level: string;
  explanation: string;
  recommendation: string;
  location?: string;
}

export interface ContractAnalysisResult {
  vulnerabilities: ContractVulnerability[];
  risk_score: number;
  is_anomaly?: boolean;
  summary?: string;
  overall_assessment?: string;
}

export interface ContractListParams {
  page?: number;
  size?: number;
  search?: string;
  verified?: boolean;
  riskScoreMin?: number;
  riskScoreMax?: number;
  hasAlerts?: boolean;
  sortBy?: 'name' | 'deployedAt' | 'riskScore';
  sortOrder?: 'asc' | 'desc';
}



/**
 * ContractService provides methods to interact with smart contract data
 */
class ContractService {
  /**
   * Get a list of monitored contracts
   */
  public async getContracts(params: ContractListParams = {}): Promise<ContractListResponse> {
    try {
      return await api.get('/contracts', { params });
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  /**
   * Get contract details by address
   */
  public async getContractDetails(address: string): Promise<Contract> {
    try {
      // Validate address format
      if (!this.isValidAddress(address)) {
        throw new Error('Invalid contract address format');
      }

      return await api.get(`/contracts/${address}`);
    } catch (error) {
      console.error(`Error fetching contract details for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Get contract source code
   */
  public async getContractSourceCode(address: string): Promise<string> {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error('Invalid contract address format');
      }

      const response = await api.get(`/contracts/${address}/source`);
      return response.sourceCode || '';
    } catch (error) {
      console.error(`Error fetching source code for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Get contract analysis results
   */
  public async getContractAnalysis(address: string): Promise<ContractAnalysisResult> {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error('Invalid contract address format');
      }

      return await api.get(`/contracts/${address}/analysis`);
    } catch (error) {
      console.error(`Error fetching analysis for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Request a new analysis for a contract
   */
  public async analyzeContract(address: string, options?: { force?: boolean }): Promise<ContractType> {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error('Invalid contract address format');
      }

      // This endpoint requires authentication
      if (!getIsLoggedIn()) {
        throw new Error('Authentication required to analyze contracts');
      }

      return {
        address,
        name: 'exampleName',
        type: 'generic',
        deploymentTransaction: 'exampleTx',
        creator: 'exampleCreator',
        creationDate: new Date(),
        lastActivityDate: new Date(),
        riskScore: 100,
        anomalyDetection: {
          isAnomaly: false,
          confidence: 0,
        },
        transactions: [],
      };
    } catch (error) {
      console.error(`Error requesting analysis for ${address}:`, error);
      throw error;
    }
  }

  /**
   * Add a contract to monitoring
   */
  public async addContractToMonitoring(address: string, name?: string): Promise<Contract> {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error('Invalid contract address format');
      }

      // This endpoint requires authentication
      if (!getIsLoggedIn()) {
        throw new Error('Authentication required to add contracts for monitoring');
      }

      return await api.post('/contracts', { address, name });
    } catch (error) {
      console.error(`Error adding contract ${address} to monitoring:`, error);
      throw error;
    }
  }

  /**
   * Remove a contract from monitoring
   */
  public async removeContractFromMonitoring(address: string): Promise<void> {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error('Invalid contract address format');
      }

      // This endpoint requires authentication
      if (!getIsLoggedIn()) {
        throw new Error('Authentication required to remove contracts from monitoring');
      }

      await api.delete(`/contracts/${address}`);
    } catch (error) {
      console.error(`Error removing contract ${address} from monitoring:`, error);
      throw error;
    }
  }

  /**
   * Get contract statistics
   */
  public async getContractStats(): Promise<{
    total: number;
    verified: number;
    monitored: number;
    atRisk: number;
  }> {
    try {
      return await api.get('/contracts/stats');
    } catch (error) {
      console.error('Error fetching contract statistics:', error);
      throw error;
    }
  }

  /**
   * Validate MultiversX address format
   */
  private isValidAddress(address: string): boolean {
    try {
      // Use the SDK's Address validation
      new Address(address);
      return true;
    } catch {
      return false;
    }
  }
}

const contractService = new ContractService();
export default contractService;
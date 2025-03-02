import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Default API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'; // Use localhost for development
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Api class provides a base client for all API services in the application
 */
export class Api {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    // Create axios instance with minimal headers
    this.axiosInstance = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        // Remove 'Accept' header to reduce size
      },
      // Disable automatic transforms that might add headers
      transformRequest: [(data) => JSON.stringify(data)],
      transformResponse: [(data) => {
        try {
          return JSON.parse(data);
        } catch (e) {
          return data;
        }
      }]
    });

    // Simplified request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Only add auth token if absolutely necessary
        if (this.authToken && config.url?.includes('/protected')) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Simplified response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );
  }

  /**
   * Set auth token for protected API calls
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('sentinel_auth_token', token);
  }

  /**
   * Clear auth token
   */
  public clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('sentinel_auth_token');
  }

  /**
   * Restore auth token from local storage
   */
  public restoreAuthToken(): boolean {
    const token = localStorage.getItem('sentinel_auth_token');
    if (token) {
      this.authToken = token;
      return true;
    }
    return false;
  }

  /**
   * GET request wrapper
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      console.error(`GET request error for ${url}:`, error);
      throw error;
    }
  }

  /**
   * POST request wrapper
   */
  public async post<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST request error for ${url}:`, error);
      throw error;
    }
  }

  /**
   * PUT request wrapper
   */
  public async put<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  /**
   * DELETE request wrapper
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  /**
   * PATCH request wrapper
   */
  public async patch<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  /**
   * Analyzes a GitHub repository by sending a POST request to /analyze-repo
   * @param repoUrl The GitHub repository URL to analyze
   * @returns The analysis results from the backend
   */
  public async analyzeRepo(repoUrl: string): Promise<any> {
    return this.post('/analyze-repo', { repoUrl });
  }
}

// Create a default instance
const api = new Api();

// Try to restore auth token on initialization
api.restoreAuthToken();

export default api;

// Contract-related API calls
export const contractService = {
  // Get all contracts
  getContracts: () => api.get('/api/contracts'),
  
  // Get a single contract by ID
  getContract: (id: string) => api.get(`/api/contracts/${id}`),
  
  // Create a new contract
  createContract: (contractData: any) => api.post('/api/contracts', contractData),
  
  // Analyze a contract
  analyzeContract: (contractAddress: string) => api.post('/api/contracts/analyze', { address: contractAddress }),
  
  // Analyze contract from file upload
  analyzeContractFile: (file: File, contractId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contractId', contractId);
    return api.post('/api/ai-analysis/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Analyze contract from source code
  analyzeContractCode: (sourceCode: string, contractId: string, fileName: string = 'contract.rs') => {
    return api.post('/api/ai-analysis/analyze-code', {
      contractId,
      code: sourceCode,
      fileName,
    });
  },
  
  // Analyze GitHub repository
  analyzeGitHubRepo: (repoUrl: string, contractId: string) => {
    return api.post('/api/ai-analysis/analyze-repo', {
      contractId,
      repoUrl,
    });
  },
};

// Alert-related API calls
export const alertService = {
  // Get all alerts
  getAlerts: () => api.get('/api/alerts'),
  
  // Get alerts for a specific contract
  getAlertsByContract: (contractId: string) => api.get(`/api/alerts/contract/${contractId}`),
  
  // Update alert status
  updateAlertStatus: (alertId: string, status: string) => 
    api.patch(`/api/alerts/${alertId}`, { status }),
};

// Transaction-related API calls
export const transactionService = {
  // Get all transactions
  getTransactions: () => api.get('/api/transactions'),
  
  // Get transactions for a specific contract
  getTransactionsByContract: (contractId: string) => 
    api.get(`/api/transactions/contract/${contractId}`),
  
  // Monitor a transaction
  monitorTransaction: (txHash: string) => 
    api.post('/api/transactions/monitor', { txHash }),
};
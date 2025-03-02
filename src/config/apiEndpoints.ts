// src/config/apiEndpoints.ts
/**
 * Centralized API endpoints configuration
 * 
 * This file serves as the single source of truth for all API endpoints
 * in the application, to prevent endpoint mismatches between frontend and backend.
 */

export const API_ENDPOINTS = {
    // App endpoints
    APP: {
      ROOT: '/',
      HEALTH: '/health',
      CONFIG: '/config'
    },
    
    // Contract endpoints
    CONTRACTS: {
      ALL: '/contracts',
      CREATE: '/contracts',
      DELETE: (address: string) => `/contracts/${address}`,
      ALERTS: (address: string) => `/contracts/${address}/alerts`,
      TRANSACTIONS: (address: string) => `/contracts/${address}/transactions`,
      HEALTH: (address: string) => `/contracts/${address}/health`
    },
    
    // Alert endpoints
    ALERTS: {
      ALL: '/alerts',
      HIGH_RISK: '/alerts/high-risk',
      DETAILS: (id: string) => `/alerts/${id}`,
      RESOLVE: (id: string) => `/alerts/${id}/resolve`,
      STATS: '/alerts/stats/summary'
    },
    
    // Transaction endpoints
    TRANSACTIONS: {
      ALL: '/transactions',
      HIGH_RISK: '/transactions/high-risk',
      DETAILS: (hash: string) => `/transactions/${hash}`,
      BY_CONTRACT: (address: string) => `/transactions/contract/${address}`
    },
    
    // Metrics endpoints
    METRICS: {
      ALL: '/metrics',
      CACHE: '/metrics/cache'
    },
    
    // AI Analysis endpoints
    AI_ANALYSIS: {
      ALL: '/ai-analysis',
      CONTRACT: '/ai-analysis/contract',
      TRANSACTION: '/ai-analysis/transaction',
      HEALTH: '/ai-analysis/health',
      ANALYZE_CODE: '/ai-analysis/analyze-code',
      UPLOAD: '/ai-analysis/upload',
      ANALYZE_REPO: '/ai-analysis/analyze-repo',
      DETAILS: (contractId: string) => `/ai-analysis/${contractId}`
    }
  };
  
  /**
   * Usage examples:
   * 
   * // GET all contracts
   * fetch(API_ENDPOINTS.CONTRACTS.ALL)
   * 
   * // GET alerts for a specific contract
   * fetch(API_ENDPOINTS.CONTRACTS.ALERTS('erd1qqqq...'))
   * 
   * // POST to analyze code
   * fetch(API_ENDPOINTS.AI_ANALYSIS.ANALYZE_CODE, {
   *   method: 'POST',
   *   body: JSON.stringify({ code, fileName })
   * })
   */
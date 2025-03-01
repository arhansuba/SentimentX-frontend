// utils/constants.ts
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

// API endpoints
export const API_ENDPOINTS = {
  CONTRACTS: `${API_BASE_URL}/contracts`,
  ALERTS: `${API_BASE_URL}/alerts`,
  TRANSACTIONS: `${API_BASE_URL}/transactions`,
  METRICS: `${API_BASE_URL}/metrics`,
};

// MultiversX blockchain explorer base URLs
export const EXPLORER_URLS = {
  MAINNET: 'https://explorer.multiversx.com',
  DEVNET: 'https://devnet-explorer.multiversx.com',
  TESTNET: 'https://testnet-explorer.multiversx.com',
};

// Transaction statuses
export const TX_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  INVALID: 'invalid',
};

// Alert severity levels
export const ALERT_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
};

// Alert types
export const ALERT_TYPES = {
  REENTRANCY: 'reentrancy',
  FLASH_LOAN: 'flashloan',
  OVERFLOW: 'overflow',
  ACCESS_CONTROL: 'accessControl',
  SUSPICIOUS_TRANSACTION: 'suspiciousTransaction',
  PRICE_MANIPULATION: 'priceManipulation',
  FRONT_RUNNING: 'frontRunning',
};

// Contract types
export const CONTRACT_TYPES = {
  TOKEN: 'token',
  NFT: 'nft',
  DEFI: 'defi',
  DAO: 'dao',
  GENERIC: 'generic',
};

// Default pagination
export const DEFAULT_PAGE_SIZE = 10;

// Max gas for transactions
export const MAX_GAS_LIMIT = 500000000;

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 60000, // 1 minute
  ALERTS: 30000,    // 30 seconds
  TRANSACTIONS: 15000, // 15 seconds
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#7371fc',
  SECONDARY: '#3ec6eb',
  SUCCESS: '#4ade80',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
};
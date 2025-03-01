// utils/formatters.ts
import { format } from 'date-fns';
import { BigNumber } from 'bignumber.js';

// Format address for display (truncate middle)
export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

// Format timestamp to readable date
export const formatDate = (timestamp: number | string | Date): string => {
  const date = new Date(timestamp);
  return format(date, 'MMM dd, yyyy HH:mm:ss');
};

// Format amount with token name
export const formatAmount = (amount: string | number | BigNumber, tokenName: string = 'EGLD', decimals: number = 18): string => {
  const bn = new BigNumber(amount);
  const formatted = bn.dividedBy(new BigNumber(10).pow(decimals)).toFixed(4);
  return `${formatted} ${tokenName}`;
};

// Format gas
export const formatGas = (gas: string | number | BigNumber): string => {
  const bn = new BigNumber(gas);
  return bn.toFormat(0);
};

// Format security score
export const formatSecurityScore = (score: number): string => {
  if (score >= 80) return `${score}% - High`;
  if (score >= 50) return `${score}% - Medium`;
  return `${score}% - Low`;
};

// Add thousands separators to numbers
export const formatNumber = (num: number | string | BigNumber): string => {
  const bn = new BigNumber(num);
  return bn.toFormat();
};

// Format transaction status
export const formatTransactionStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'success': 'Successful',
    'failed': 'Failed',
    'invalid': 'Invalid',
  };
  
  return statusMap[status.toLowerCase()] || status;
};

// Format contract type
export const formatContractType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'token': 'Token Contract',
    'nft': 'NFT Contract',
    'defi': 'DeFi Protocol',
    'dao': 'DAO',
    'generic': 'Smart Contract',
  };
  
  return typeMap[type.toLowerCase()] || 'Smart Contract';
};
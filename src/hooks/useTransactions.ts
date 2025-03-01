// hooks/useTransactions.ts
import { useEffect, useCallback } from 'react';
import { useSentinelContext } from '../context/SentinelContext';
import transactionService, { TransactionListParams } from '../services/transactionService';
import { TransactionType } from '@/types/transaction';
import { ContractType } from '@/types/contract';

export const useTransactions = () => {
  const { state, dispatch } = useSentinelContext();
  const { transactions, loading, error } = state;

  const fetchTransactions = useCallback(async (params?: TransactionListParams) => {
    try {
      dispatch({ type: 'SET_TRANSACTIONS_LOADING', payload: true });
      dispatch({ type: 'SET_TRANSACTIONS_ERROR', payload: null });
      
      const data = await transactionService.getTransactions(params);
      const mappedTransactions = data.transactions.map(tx => ({
        id: tx.hash,
        contractAddress: tx.receiver,
        riskScore: tx.analysis?.riskScore || 0,
        anomalyDetection: tx.analysis?.anomalyScore || 0,
        hash: tx.hash,
        sender: tx.sender,
        value: tx.value,
        gasLimit: tx.gasLimit,
        gasPrice: tx.gasPrice,
        gasUsed: tx.gasUsed,
        nonce: tx.nonce,
        data: tx.data,
        decodedData: tx.decodedData,
        timestamp: tx.timestamp,
        status: tx.status,
        blockHash: tx.blockHash,
        blockNonce: tx.blockNonce,
        signature: tx.signature,
        fee: tx.fee,
        type: tx.type,
        severity: tx.severity,
        title: tx.title,
        description: tx.description
      }));
      dispatch({ type: 'SET_TRANSACTIONS', payload: mappedTransactions as unknown as TransactionType[] });
    } catch (err) {
      dispatch({ 
        type: 'SET_TRANSACTIONS_ERROR', 
        payload: err instanceof Error ? err.message : 'Unknown error fetching transactions' 
      });
    } finally {
      dispatch({ type: 'SET_TRANSACTIONS_LOADING', payload: false });
    }
  }, [dispatch]);

  const getTransactionById = useCallback((id: string) => {
    return transactions.find(tx => tx.id === id);
  }, [transactions]);

  const getTransactionsByContractId = useCallback((contractId: string) => {
    return transactions.filter(tx => tx.contractId === contractId);
  }, [transactions]);

  const monitorTransaction = useCallback(async (txHash: string): Promise<ContractType> => {
    try {
      dispatch({ type: 'SET_TRANSACTIONS_LOADING', payload: true });
      
      const result = await transactionService.addTransactionToMonitoring(txHash);
      
      if (result === undefined) {
        throw new Error('Failed to monitor transaction');
      }  
      
      // Update transactions list with new transaction
      const transactionData = result as TransactionType;
      dispatch({ 
        type: 'SET_TRANSACTIONS', 
        payload: [...transactions, transactionData] 
      });
      
      return {
        address: transactionData.contractAddress,
        name: 'Unknown Contract',
        type: 'Monitored',
        deploymentTransaction: txHash,
        creator: transactionData.sender,
        creationDate: new Date(transactionData.timestamp),
        lastActivityDate: new Date(),
        riskScore: transactionData.riskScore,
        anomalyDetection: transactionData.anomalyDetection,
        transactions: [txHash]
      };
    } catch (err) {
      dispatch({ 
        type: 'SET_TRANSACTIONS_ERROR', 
        payload: err instanceof Error ? err.message : 'Unknown error monitoring transaction' 
      });
      throw err;
    } finally {
      dispatch({ type: 'SET_TRANSACTIONS_LOADING', payload: false });
    }
  }, [transactions, dispatch]);

  const analyzeTransactionPattern = useCallback(async (contractAddress: string) => {
    try {
      dispatch({ type: 'SET_TRANSACTIONS_LOADING', payload: true });
      
      const patterns = await transactionService.analyzeTransaction(contractAddress);
      return patterns;
    } catch (err) {
      dispatch({ 
        type: 'SET_TRANSACTIONS_ERROR', 
        payload: err instanceof Error ? err.message : 'Unknown error analyzing transaction patterns' 
      });
      throw err;
    } finally {
      dispatch({ type: 'SET_TRANSACTIONS_LOADING', payload: false });
    }
  }, [dispatch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading: loading.transactions,
    error: error.transactions,
    fetchTransactions,
    getTransactionById,
    getTransactionsByContractId,
    monitorTransaction,
    analyzeTransactionPattern
  };
};
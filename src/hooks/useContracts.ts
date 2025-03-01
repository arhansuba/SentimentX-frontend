// hooks/useContracts.ts
import { useEffect, useCallback } from 'react';
import { useSentinelContext } from '../context/SentinelContext';
import contractService from '../services/contractService';
import { ContractType, ContractListResponse } from '../types/contract';

export const useContracts = () => {
  const { state, dispatch } = useSentinelContext();
  const { contracts, loading, error } = state;

  const fetchContracts = useCallback(async () => {
    try {
      dispatch({ type: 'SET_CONTRACTS_LOADING', payload: true });
      dispatch({ type: 'SET_CONTRACTS_ERROR', payload: null });
      
      const data: ContractListResponse = await contractService.getContracts();
      dispatch({ type: 'SET_CONTRACTS', payload: data.contracts });
    } catch (err) {
      dispatch({ 
        type: 'SET_CONTRACTS_ERROR', 
        payload: err instanceof Error ? err.message : 'Unknown error fetching contracts' 
      });
    } finally {
      dispatch({ type: 'SET_CONTRACTS_LOADING', payload: false });
    }
  }, [dispatch]);

  const getContractById = useCallback((address: string) => {
    return contracts.find(contract => contract.address === address);
  }, [contracts]);

  const analyzeContract = useCallback(async (address: string) => {
    try {
      dispatch({ type: 'SET_CONTRACTS_LOADING', payload: true });
      dispatch({ type: 'SET_CONTRACTS_ERROR', payload: null });
      
      const result: ContractType = await contractService.analyzeContract(address);
      
      // Update contracts list with new or updated contract
      const updatedContracts = [...contracts];
      const existingIndex = contracts.findIndex(c => c.address === address);
      
      if (existingIndex >= 0) {
        updatedContracts[existingIndex] = result;
      } else {
        updatedContracts.push(result);
      }
      
      dispatch({ type: 'SET_CONTRACTS', payload: updatedContracts });
      return result;
    } catch (err) {
      dispatch({ 
        type: 'SET_CONTRACTS_ERROR', 
        payload: err instanceof Error ? err.message : 'Unknown error analyzing contract' 
      });
      throw err;
    } finally {
      dispatch({ type: 'SET_CONTRACTS_LOADING', payload: false });
    }
  }, [contracts, dispatch]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    loading: loading.contracts,
    error: error.contracts,
    fetchContracts,
    getContractById,
    analyzeContract
  };
};
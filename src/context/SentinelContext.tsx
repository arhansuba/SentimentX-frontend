// SentinelContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ContractType } from '../types/contract';
import { AlertType } from '../types/alert';
import { TransactionType } from '../types/transaction';

// Define the state shape
interface SentinelState {
  contracts: ContractType[];
  alerts: AlertType[];
  transactions: TransactionType[];
  loading: {
    contracts: boolean;
    alerts: boolean;
    transactions: boolean;
  };
  error: {
    contracts: string | null;
    alerts: string | null;
    transactions: string | null;
  };
}

// Define action types
type ActionType =
  | { type: 'SET_CONTRACTS'; payload: ContractType[] }
  | { type: 'SET_ALERTS'; payload: AlertType[] }
  | { type: 'SET_TRANSACTIONS'; payload: TransactionType[] }
  | { type: 'SET_CONTRACTS_LOADING'; payload: boolean }
  | { type: 'SET_ALERTS_LOADING'; payload: boolean }
  | { type: 'SET_TRANSACTIONS_LOADING'; payload: boolean }
  | { type: 'SET_CONTRACTS_ERROR'; payload: string | null }
  | { type: 'SET_ALERTS_ERROR'; payload: string | null }
  | { type: 'SET_TRANSACTIONS_ERROR'; payload: string | null };

// Define initial state
const initialState: SentinelState = {
  contracts: [],
  alerts: [],
  transactions: [],
  loading: {
    contracts: false,
    alerts: false,
    transactions: false,
  },
  error: {
    contracts: null,
    alerts: null,
    transactions: null,
  },
};

// Create reducer
const sentinelReducer = (state: SentinelState, action: ActionType): SentinelState => {
  switch (action.type) {
    case 'SET_CONTRACTS':
      return { ...state, contracts: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_CONTRACTS_LOADING':
      return { ...state, loading: { ...state.loading, contracts: action.payload } };
    case 'SET_ALERTS_LOADING':
      return { ...state, loading: { ...state.loading, alerts: action.payload } };
    case 'SET_TRANSACTIONS_LOADING':
      return { ...state, loading: { ...state.loading, transactions: action.payload } };
    case 'SET_CONTRACTS_ERROR':
      return { ...state, error: { ...state.error, contracts: action.payload } };
    case 'SET_ALERTS_ERROR':
      return { ...state, error: { ...state.error, alerts: action.payload } };
    case 'SET_TRANSACTIONS_ERROR':
      return { ...state, error: { ...state.error, transactions: action.payload } };
    default:
      return state;
  }
};

// Create context
interface SentinelContextType {
  state: SentinelState;
  dispatch: React.Dispatch<ActionType>;
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

// Create provider
interface SentinelProviderProps {
  children: ReactNode;
}

export const SentinelProvider: React.FC<SentinelProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(sentinelReducer, initialState);

  return (
    <SentinelContext.Provider value={{ state, dispatch }}>
      {children}
    </SentinelContext.Provider>
  );
};

// Custom hook to use the context
export const useSentinelContext = (): SentinelContextType => {
  const context = useContext(SentinelContext);
  if (context === undefined) {
    throw new Error('useSentinelContext must be used within a SentinelProvider');
  }
  return context;
};
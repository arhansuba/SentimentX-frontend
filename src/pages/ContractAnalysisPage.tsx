import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContractAnalysis from '../components/Analysis/ContractAnalysis';
//import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks/accounts';
import { addressIsValid } from '@multiversx/sdk-dapp/utils/account';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';

interface ContractDetails {
  address: string;
  name?: string;
  creator?: string;
  deploymentTx?: string;
  deployedAt?: string;
  balance?: string;
  code?: string;
  isVerified?: boolean;
  sourceCode?: string;
}

interface AnalysisResult {
  vulnerabilities: Array<{
    type: string;
    risk_level: string;
    explanation: string;
    recommendation: string;
    location?: string;
  }>;
  risk_score: number;
  is_anomaly?: boolean;
  summary?: string;
  overall_assessment?: string; 
}

const ContractAnalysisPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  useGetAccountInfo();
  
  const [contractDetails, setContractDetails] = useState<ContractDetails | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  
  useEffect(() => {
    if (!address) {
      setError('No contract address provided');
      setLoading(false);
      return;
    }
    
    if (!addressIsValid(address)) {
      setError('Invalid contract address format');
      setLoading(false); 
      return;
    }
    
    fetchContractDetails(address);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);
  
  const fetchContractDetails = async (contractAddress: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/contracts/${contractAddress}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contract details');
      }
      
      const data = await response.json();
      setContractDetails(data);
      
      // Check if contract has been analyzed before
      const analysisResponse = await fetch(`/api/contracts/${contractAddress}/analysis`);
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setAnalysisResult(analysisData);
      }
    } catch (err) {
      console.error('Error fetching contract details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // For demonstration purposes, set mock data
      if (address) {
        setContractDetails({
          address,
          name: 'Sample DEX Contract',
          creator: 'erd1qj3z8p4ysuzu3u8wpmf0w5dlc6a5qtn0amxvelc2qmgnutm3tc6qpla8jv',
          deploymentTx: '7d2c01a2d1565a9d7f32281acffd83d93e16e2ecf71243a6893c2add97818ad9',
          deployedAt: '2023-07-15T14:32:18Z',
          balance: '423500000000000000000',
          isVerified: true,
          sourceCode: `#![no_std]

heapless::pool!(
    SparseArray<T>: u8;
    allocation_log: [1 => 0, 8 => 1, 32 => 4, 64 => 2, 256 => 1]
);

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

mod events;
mod liquidity_pool;
mod pair;
mod router;
mod errors;
mod config;

use liquidity_pool::LiquidityPool;
use pair::Pair;
use router::Router;
use config::Config;

#[multiversx_sc::contract]
pub trait Dex:
    Router + 
    Pair +
    LiquidityPool +
    Config
{
    #[init]
    fn init(&self) {
        self.state().set_default();
        self.fee_percent().set_default();
        self.special_fee_percent().set_default();
        self.total_fee_percent().set_default();
        self.locked_lp_token_energy_amount().set_default();
    }

    #[upgrade]
    fn upgrade(&self) {
        self.state().set_default();
        self.fee_percent().set_default();
        self.special_fee_percent().set_default();
        self.total_fee_percent().set_default();
        self.locked_lp_token_energy_amount().set_default();
    }
}`
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setAnalyzing(false);
  };
  
  const startNewAnalysis = () => {
    setAnalyzing(true);
    setAnalysisResult(null);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    onClick={() => navigate('/contracts')}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100"
                  >
                    Go to Contracts
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="ml-3 bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Contract Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {contractDetails?.name || 'Smart Contract Analysis'}
              {contractDetails?.isVerified && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Verified
                </span>
              )}
            </h1>
            <p className="text-gray-500 break-all">
              {contractDetails?.address}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={startNewAnalysis}
              disabled={analyzing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : (analysisResult ? 'Re-analyze Contract' : 'Analyze Contract')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Contract Details and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar with Contract Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Contract Details</h2>
            
            <div className="space-y-4">
              {contractDetails?.creator && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Creator</h3>
                  <p className="mt-1 text-sm">
                    <a 
                      href={`/accounts/${contractDetails.creator}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {contractDetails.creator.substring(0, 10)}...{contractDetails.creator.substring(contractDetails.creator.length - 6)}
                    </a>
                  </p>
                </div>
              )}
              
              {contractDetails?.deployedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Deployed</h3>
                  <p className="mt-1 text-sm">
                    {new Date(contractDetails.deployedAt).toLocaleDateString()} ({new Date(contractDetails.deployedAt).toLocaleTimeString()})
                  </p>
                </div>
              )}
              
              {contractDetails?.deploymentTx && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Deployment Transaction</h3>
                  <p className="mt-1 text-sm">
                    <a 
                      href={`/transactions/${contractDetails.deploymentTx}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {contractDetails.deploymentTx.substring(0, 10)}...{contractDetails.deploymentTx.substring(contractDetails.deploymentTx.length - 6)}
                    </a>
                  </p>
                </div>
              )}
              
              {contractDetails?.balance && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Balance</h3>
                  <p className="mt-1 text-sm">
                    {(parseFloat(contractDetails.balance) / 1e18).toFixed(4)} EGLD
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Source Code</h3>
                {contractDetails?.isVerified ? (
                  <div className="mt-1">
                    <div className="bg-gray-50 p-2 rounded-md">
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        <code>
                          {contractDetails.sourceCode ? 
                            (contractDetails.sourceCode.length > 500 ?
                              `${contractDetails.sourceCode.substring(0, 500)}...` :
                              contractDetails.sourceCode) :
                            'Source code available but not loaded'}
                        </code>
                      </pre>
                    </div>
                    <a 
                      href={`/contracts/${address}/source`}
                      className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800"
                    >
                      View full source code
                    </a>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Contract source code not verified
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Contract Analysis */}
        <div className="lg:col-span-2">
          <ContractAnalysis 
            contractData={contractDetails} 
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default ContractAnalysisPage;
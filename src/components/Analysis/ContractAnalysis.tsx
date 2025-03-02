// src/components/Analysis/ContractAnalysis.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
// import AiAnalysis from './AiAnalysis';
// import PatternDetection from './PatternDetection';
// import VulnerabilityChart from './VulnerabilityChart';

// Types
interface Vulnerability {
  id: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  location: string;
  detectedAt: string;
  status: 'New' | 'Acknowledged' | 'Resolved' | 'False Positive';
}

interface FileAnalysis {
  fileName: string;
  analysis: {
    securityScore: number;
    vulnerabilities: Vulnerability[];
  };
}

interface ContractData {
  address: string;
  name: string;
  riskScore: number;
  securityStatus: 'Safe' | 'Moderate Risk' | 'High Risk' | 'Critical Risk';
  vulnerabilities: Vulnerability[];
  transactionCount: number;
  alertCount: number;
  deployedAt: string;
  lastActivity: string;
  codeSize: number;
}

interface ContractAnalysisProps {
  contractData?: ContractData;
  analysisResults?: FileAnalysis[];
}

// Utility function to style severity badges
const getSeverityClass = (severity: string) => {
  switch (severity) {
    case 'Critical':
      return 'bg-red-600';
    case 'High':
      return 'bg-orange-500';
    case 'Medium':
      return 'bg-yellow-500';
    case 'Low':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

const ContractAnalysis: React.FC<ContractAnalysisProps> = ({ contractData, analysisResults = [] }) => {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  // For demo purposes - simulate step-by-step analysis
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isAnalyzing && analysisStep < 5) {
      timer = setTimeout(() => {
        setAnalysisStep(prevStep => prevStep + 1);
      }, 800);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAnalyzing, analysisStep]);

  const handleAnalyze = async () => {
    if (!contractAddress || contractAddress.trim().length < 10) {
      setError('Please enter a valid MultiversX contract address');
      return;
    }

    try {
      setError(null);
      setIsAnalyzing(true);
      setAnalysisStep(0);
      
      // Note: This function should actually call an API to analyze the contract
      // For now, we'll just set a timer to simulate the analysis
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 4000);
      
    } catch (err) {
      setError('Error analyzing contract. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const renderAnalysisSteps = () => {
    const steps = [
      'Fetching contract bytecode...',
      'Analyzing control flow patterns...',
      'Running AI vulnerability detection...',
      'Checking historical transactions...',
      'Generating security assessment...'
    ];

    return (
      <div className="bg-gray-800 p-4 rounded-md text-white font-mono text-sm my-4">
        {steps.map((step, index) => (
          <div key={index} className={`mb-2 flex items-center ${index > analysisStep ? 'opacity-30' : ''}`}>
            {index < analysisStep ? (
              <span className="text-green-400 mr-2">✓</span>
            ) : index === analysisStep ? (
              <span className="text-blue-400 animate-pulse mr-2">▶</span>
            ) : (
              <span className="text-gray-500 mr-2">○</span>
            )}
            {step}
          </div>
        ))}
      </div>
    );
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-600';
      case 'Acknowledged': return 'bg-purple-600';
      case 'Resolved': return 'bg-green-600';
      case 'False Positive': return 'bg-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const getSecurityStatusClass = (status: string) => {
    switch (status) {
      case 'Safe': return 'text-green-500';
      case 'Moderate Risk': return 'text-yellow-500';
      case 'High Risk': return 'text-orange-500';
      case 'Critical Risk': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">MultiversX AI Smart Contract Sentinel</h1>
      
      {!contractData && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Smart Contract Analysis</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="Enter MultiversX contract address (e.g. erd1qqqq...)"
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              {isAnalyzing ? <LoadingSpinner /> : 'Analyze Contract'}
            </Button>
          </div>
          {error && <p className="mt-2 text-red-500">{error}</p>}
          
          {/* Preset examples for demo */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setContractAddress('erd1qqqq...wxzc')}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
              >
                ElrondSwap
              </button>
              <button 
                onClick={() => setContractAddress('erd1qqqq...qgg')}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
              >
                Lending Protocol
              </button>
              <button 
                onClick={() => setContractAddress('erd1qqqq...2twr')}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
              >
                NFT Marketplace
              </button>
              <button 
                onClick={() => setContractAddress('erd1qqqq...kepz')}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full"
              >
                Swap Protocol
              </button>
            </div>
          </div>
        </Card>
      )}
      
      {isAnalyzing && renderAnalysisSteps()}
      
      {contractData && (
        <>
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h2 className="text-xl font-semibold">{contractData.name}</h2>
                <p className="text-gray-600 text-sm">{contractData.address}</p>
              </div>
              <div className="flex items-center mt-4 md:mt-0">
                <div className="mr-6">
                  <p className="text-sm text-gray-600">Risk Score</p>
                  <p className="text-xl font-semibold">{contractData.riskScore}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Security Status</p>
                  <p className={`text-xl font-semibold ${getSecurityStatusClass(contractData.securityStatus)}`}>
                    {contractData.securityStatus}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-lg font-semibold">{contractData.transactionCount}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-lg font-semibold">{contractData.alertCount}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm text-gray-600">Deployed</p>
                <p className="text-lg font-semibold">{new Date(contractData.deployedAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm text-gray-600">Code Size</p>
                <p className="text-lg font-semibold">{contractData.codeSize} bytes</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* <Card>
              <h2 className="text-xl font-semibold mb-4">Vulnerability Analysis</h2>
              <VulnerabilityChart
                criticalCount={contractData.vulnerabilities.filter(v => v.severity === 'Critical').length}
                highCount={contractData.vulnerabilities.filter(v => v.severity === 'High').length}
                mediumCount={contractData.vulnerabilities.filter(v => v.severity === 'Medium').length}
                lowCount={contractData.vulnerabilities.filter(v => v.severity === 'Low').length}
              />
            </Card>
            
            <Card>
              <h2 className="text-xl font-semibold mb-4">Pattern Detection</h2>
              <PatternDetection contractData={contractData} />
            </Card> */}
          </div>

          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Detected Vulnerabilities</h2>
            
            {contractData.vulnerabilities.length === 0 ? (
              <div className="bg-green-100 text-green-800 p-4 rounded-md">
                No vulnerabilities detected in this contract.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Vulnerability</th>
                      <th className="p-3 text-left">Severity</th>
                      <th className="p-3 text-left">Location</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractData.vulnerabilities.map((vuln) => (
                      <tr key={vuln.id} className="border-t">
                        <td className="p-3">
                          <div className="font-medium">{vuln.name}</div>
                          <div className="text-sm text-gray-600">{vuln.description}</div>
                        </td>
                        <td className="p-3">
                          <span className={`${getSeverityClass(vuln.severity)} text-white text-xs px-2 py-1 rounded-full`}>
                            {vuln.severity}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-sm">{vuln.location}</td>
                        <td className="p-3">
                          <span className={`${getStatusClass(vuln.status)} text-white text-xs px-2 py-1 rounded-full`}>
                            {vuln.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
                              Acknowledge
                            </button>
                            <button className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">
                              Resolve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          
          {/* <Card>
            <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
            <AiAnalysis contractAddress={contractData.address} />
          </Card> */}
        </>
      )}

      {/* Repository Analysis Results */}
      {analysisResults && analysisResults.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Repository Analysis Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">File Name</th>
                  <th className="p-3 text-left">Security Score</th>
                  <th className="p-3 text-left">Vulnerabilities</th>
                </tr>
              </thead>
              <tbody>
                {analysisResults.map((result, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{result.fileName}</td>
                    <td className="p-3">{result.analysis.securityScore}</td>
                    <td className="p-3">
                      {result.analysis.vulnerabilities.length === 0 ? (
                        <span className="text-green-600">No vulnerabilities detected</span>
                      ) : (
                        <ul className="list-disc list-inside">
                          {result.analysis.vulnerabilities.map((vuln, vIndex) => (
                            <li key={vIndex}>
                              <span
                                className={`${getSeverityClass(
                                  vuln.severity
                                )} text-white text-xs px-2 py-1 rounded-full`}
                              >
                                {vuln.severity}
                              </span>{' '}
                              - {vuln.name}: {vuln.description}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ContractAnalysis;
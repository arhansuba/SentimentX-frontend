import React, { useState, useEffect } from 'react';
import AiAnalysis from './AiAnalysis';
import PatternDetection from './PatternDetection';
import VulnerabilityChart from './VulnerabilityChart';

interface ContractAnalysisProps {
  contractAddress?: string;
  contractCode?: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export interface Vulnerability {
  type: string;
  risk_level: string;
  explanation: string;
  recommendation: string;
  location?: string;
}

export interface AnalysisResult {
  vulnerabilities: Vulnerability[];
  risk_score: number;
  is_anomaly?: boolean;
  summary?: string;
  overall_assessment?: string;
}

const ContractAnalysis: React.FC<ContractAnalysisProps> = ({
  contractAddress,
  contractCode,
  onAnalysisComplete
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'pattern'>('ai');
  const [contractData, setContractData] = useState<string>(contractCode || '');
  const [address, setAddress] = useState<string>(contractAddress || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [patternResults, setPatternResults] = useState<any[] | null>(null);

  useEffect(() => {
    if (contractAddress) {
      setAddress(contractAddress);
      fetchContractCode(contractAddress);
    }
    
    if (contractCode) {
      setContractData(contractCode);
    }
  }, [contractAddress, contractCode]);

  const fetchContractCode = async (address: string) => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${address}/code`);
      if (!response.ok) {
        throw new Error('Failed to fetch contract code');
      }
      
      const data = await response.json();
      setContractData(data.sourceCode || '');
    } catch (error) {
      console.error('Error fetching contract code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiAnalysisResult = (result: AnalysisResult | null) => {
    if (result) {
      setAnalysisResult(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    }
  };

  const handlePatternDetectionResult = (results: any[] | null) => {
    if (results) {
      setPatternResults(results);
      
      // Convert pattern results to a format compatible with AnalysisResult
      const vulnerabilities = results.flatMap(pattern => 
        pattern.matches.map((match: any) => ({
          type: pattern.name,
          risk_level: pattern.severity,
          explanation: `${pattern.description} Found at line ${match.lineNumber}.`,
          recommendation: 'Review the code at the specified location to ensure it follows security best practices.',
          location: `Line ${match.lineNumber}: ${match.text}`
        }))
      );
      
      // Calculate a simple risk score based on severity
      const severityWeights: {[key: string]: number} = {
        'critical': 100,
        'high': 75,
        'medium': 50,
        'low': 25
      };
      
      const totalWeight = results.reduce((sum, pattern) => 
        sum + (severityWeights[pattern.severity] || 0) * pattern.matches.length, 0);
      
      const maxPossibleScore = 100;
      const risk_score = Math.min(
        Math.round((totalWeight / (results.length || 1)) || 0),
        maxPossibleScore
      );
      
      const patternAnalysisResult: AnalysisResult = {
        vulnerabilities,
        risk_score,
        summary: `Pattern analysis detected ${vulnerabilities.length} potential issues across ${results.length} vulnerability patterns.`
      };
      
      // Only update analysis result if we're on the pattern tab
      if (activeTab === 'pattern' && onAnalysisComplete) {
        onAnalysisComplete(patternAnalysisResult);
      }
    }
  };

  // Combine AI and pattern-based analyses
  const combinedVulnerabilities = [
    ...(analysisResult?.vulnerabilities || []),
    ...(patternResults?.flatMap(pattern => 
      pattern.matches.map((match: any) => ({
        type: pattern.name,
        risk_level: pattern.severity,
        explanation: `${pattern.description} Found at line ${match.lineNumber}.`,
        recommendation: 'Review the code at the specified location to ensure it follows security best practices.',
        location: `Line ${match.lineNumber}: ${match.text}`
      }))
    ) || [])
  ];

  // Aggregate vulnerabilities by type for the chart
  const vulnerabilityTypes = combinedVulnerabilities.reduce((acc: {[key: string]: number}, vuln) => {
    acc[vuln.type] = (acc[vuln.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Smart Contract Security Analysis</h2>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'ai'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('ai')}
            >
              AI Analysis
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === 'pattern'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('pattern')}
            >
              Pattern Detection
            </button>
          </li>
        </ul>
      </div>
      
      {/* Analysis Content */}
      <div className="mb-8">
        {activeTab === 'ai' ? (
          <AiAnalysis 
            contractAddress={address} 
            onAnalysisComplete={handleAiAnalysisResult}
          />
        ) : (
          <PatternDetection 
            contractCode={contractData}
            onPatternDetectionComplete={handlePatternDetectionResult}
          />
        )}
      </div>
      
      {/* Vulnerability Chart */}
      {(analysisResult || patternResults) && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Vulnerability Distribution</h3>
          <VulnerabilityChart 
            vulnerabilities={combinedVulnerabilities}
            vulnerabilityTypes={vulnerabilityTypes}
          />
        </div>
      )}
    </div>
  );
};

export default ContractAnalysis;
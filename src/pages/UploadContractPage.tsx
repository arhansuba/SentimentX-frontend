// src/pages/UploadContractPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContractUploadComponent from '../components/Upload/ContractUploadComponent';
import ContractAnalysis from '../components/Analysis/ContractAnalysis';
import { Card } from '../components/common/Card';

const UploadContractPage: React.FC = () => {
  const navigate = useNavigate();
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState<boolean>(false);

  // Handle analysis completion
  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
    setIsAnalysisComplete(true);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('analysis-results')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // Format vulnerability data for ContractAnalysis
  const formatVulnerabilityData = (analysisResults: any) => {
    // Convert API response format to ContractAnalysis component format
    if (!analysisResults?.vulnerabilities) return [];
    
    return analysisResults.vulnerabilities.map((vuln: any, index: number) => ({
      id: `vuln-${index}`,
      name: vuln.type || 'Unknown Vulnerability',
      severity: vuln.risk_level === 'critical' ? 'Critical' : 
               vuln.risk_level === 'high' ? 'High' : 
               vuln.risk_level === 'medium' ? 'Medium' : 'Low',
      description: vuln.explanation || 'No description provided',
      location: vuln.location || 'Unknown location',
      detectedAt: new Date().toISOString(),
      status: 'New'
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analyze Smart Contract</h1>
      
      {/* Upload Component */}
      <ContractUploadComponent onAnalysisComplete={handleAnalysisComplete} />
      
      {/* Analysis Results */}
      {isAnalysisComplete && analysisResults && (
        <div id="analysis-results">
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            <div className="mb-4 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-700">
                Analysis completed successfully. The results are shown below.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium mb-2">Security Score</h3>
                <p className="text-3xl font-bold">
                  {analysisResults.securityScore || analysisResults.risk_score || 75}/100
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-md font-medium mb-2">Risk Assessment</h3>
                <p className="text-lg">
                  {analysisResults.overall_assessment || 
                   "Contract analysis complete. Review vulnerabilities listed below."}
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-md text-sm"
              >
                Back to Dashboard
              </button>
              
              <button 
                onClick={() => {
                  // Reset for new analysis
                  setAnalysisResults(null);
                  setIsAnalysisComplete(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm"
              >
                Analyze Another Contract
              </button>
              
              <button 
                onClick={() => {
                  // In a real app, this would save to user's contracts
                  alert("Contract saved to your monitored contracts!");
                }}
                className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-md text-sm"
              >
                Save to Monitored Contracts
              </button>
            </div>
          </Card>
          
          {/* Contract Analysis Component (reused from previous work) */}
          <ContractAnalysis 
            contractData={{
              address: analysisResults.contractAddress || "Not provided",
              name: analysisResults.contractName || analysisResults.fileName || "Unnamed Contract",
              riskScore: analysisResults.securityScore || analysisResults.risk_score || 75,
              securityStatus: 
                (analysisResults.securityScore || analysisResults.risk_score || 75) >= 80 ? 'Safe' :
                (analysisResults.securityScore || analysisResults.risk_score || 75) >= 60 ? 'Moderate Risk' :
                (analysisResults.securityScore || analysisResults.risk_score || 75) >= 40 ? 'High Risk' : 'Critical Risk',
              vulnerabilities: formatVulnerabilityData(analysisResults),
              transactionCount: 0,
              alertCount: analysisResults.vulnerabilities?.length || 0,
              deployedAt: new Date().toISOString(),
              lastActivity: new Date().toISOString(),
              codeSize: analysisResults.codeSize || 0
            }}
            analysisResults={
              // Format for repository analysis with multiple files
              analysisResults.files ? 
                analysisResults.files.map((file: any) => ({
                  fileName: file.fileName,
                  analysis: {
                    securityScore: file.securityScore || 75,
                    vulnerabilities: formatVulnerabilityData(file)
                  }
                })) : 
                null
            }
          />
        </div>
      )}
    </div>
  );
};

export default UploadContractPage;
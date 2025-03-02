// src/pages/ContractUploaderPage.tsx
import React, { useState, useCallback, useRef } from 'react';
//import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
//import { useContracts } from '../hooks/useContracts';
import api from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import ContractAnalysis from '../components/Analysis/ContractAnalysis';

// Define types needed for ContractAnalysis
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

const ContractUploaderPage: React.FC = () => {
  //const { analyzeContract } = useContracts();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'code' | 'github'>('file');
  const [contractAddress, setContractAddress] = useState('');
  const [contractName, setContractName] = useState('');
  const [sourceCode, setSourceCode] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  
  // States for analysis results
  const [contractData, setContractData] = useState<ContractData | undefined>(undefined);
  const [analysisResults, setAnalysisResults] = useState<FileAnalysis[]>([]);
  const [showResults, setShowResults] = useState(false);

  // For file upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const getSecurityStatus = (score: number): 'Safe' | 'Moderate Risk' | 'High Risk' | 'Critical Risk' => {
    if (score >= 80) return 'Safe';
    if (score >= 60) return 'Moderate Risk';
    if (score >= 40) return 'High Risk';
    return 'Critical Risk';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    setShowResults(false);
    
    try {
      // Generate a unique ID for the contract
      const contractId = uuidv4();
      
      // Create basic contract info first
      setLoadingStage(1);
      setLoadingText('Creating contract entry...');
      
      await api.post('/api/contracts', {
        id: contractId,
        address: contractAddress || 'Unknown',
        name: contractName || 'Unnamed Contract',
        securityScore: 0,
        createdAt: new Date().toISOString(),
      });
      
      let analysisResult;
      let fileResults: FileAnalysis[] = [];
      
      if (uploadMethod === 'file' && file) {
        // File upload method
        setLoadingStage(2);
        setLoadingText('Uploading contract file...');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('contractId', contractId);
        
        setLoadingStage(3);
        setLoadingText('Analyzing contract...');
        const response = await api.post('/api/ai-analysis/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        analysisResult = response.data;
        
        // Format result as a file analysis
        fileResults = [{
          fileName: file.name,
          analysis: {
            securityScore: analysisResult.securityScore || 0,
            vulnerabilities: analysisResult.vulnerabilities || []
          }
        }];
      } 
      else if (uploadMethod === 'code' && sourceCode) {
        // Source code method
        setLoadingStage(2);
        setLoadingText('Analyzing source code...');
        
        const response = await api.post('/api/ai-analysis/analyze-code', {
          contractId,
          code: sourceCode,
          fileName: 'contract.rs',
        });
        
        analysisResult = response.data;
        
        // Format result as a file analysis
        fileResults = [{
          fileName: 'contract.rs',
          analysis: {
            securityScore: analysisResult.securityScore || 0,
            vulnerabilities: analysisResult.vulnerabilities || []
          }
        }];
      } 
      else if (uploadMethod === 'github' && repoUrl) {
        // GitHub repository method
        setLoadingStage(2);
        setLoadingText('Cloning GitHub repository...');
        
        const response = await api.analyzeRepo(repoUrl);
        console.log('Repository analysis result:', response);
        analysisResult = response.data;
        
        // Format fileAnalyses from response
        if (analysisResult.fileAnalyses && Array.isArray(analysisResult.fileAnalyses)) {
          fileResults = analysisResult.fileAnalyses.map((file: any) => ({
            fileName: file.fileName,
            analysis: {
              securityScore: file.analysis.securityScore || 0,
              vulnerabilities: file.analysis.vulnerabilities || []
            }
          }));
        }
      } 
      else {
        throw new Error('No contract data provided');
      }
      
      setLoadingStage(4);
      setLoadingText('Analysis complete!');
      
      // Calculate total vulnerabilities across all files
      const allVulnerabilities: Vulnerability[] = [];
      let vulnerabilityId = 1;
      
      fileResults.forEach(file => {
        file.analysis.vulnerabilities.forEach(vulnerability => {
          allVulnerabilities.push({
            ...vulnerability,
            id: `vuln-${vulnerabilityId++}`,
            location: `${file.fileName}: ${vulnerability.location || 'Unknown location'}`,
            detectedAt: new Date().toISOString(),
            status: 'New'
          });
        });
      });
      
      // Create contract data object 
      const securityScore = analysisResult.securityScore || analysisResult.combinedSecurityScore || 0;
      const newContractData: ContractData = {
        address: contractAddress || 'Unknown',
        name: contractName || (uploadMethod === 'github' ? repoUrl.split('/').pop() || 'GitHub Repository' : file?.name || 'Unnamed Contract'),
        riskScore: securityScore,
        securityStatus: getSecurityStatus(securityScore),
        vulnerabilities: allVulnerabilities,
        transactionCount: 0,
        alertCount: allVulnerabilities.length,
        deployedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        codeSize: sourceCode.length || file?.size || 0
      };
      
      // Set state with results
      setContractData(newContractData);
      setAnalysisResults(fileResults);
      setShowResults(true);
      
      // Update success message
      setSuccess(`Contract analyzed successfully! Security score: ${securityScore}`);
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  const renderUploadMethod = () => {
    switch (uploadMethod) {
      case 'file':
        return (
          <>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".rs" 
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="text-blue-500 mb-4">
                <svg className="mx-auto h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-gray-700 mb-2">Drag and drop your Rust contract file here</p>
              <p className="text-gray-500 text-sm">or click to browse</p>
              {file && (
                <div className="mt-4 p-2 bg-blue-50 rounded-md">
                  <p className="text-blue-700 font-medium">{file.name}</p>
                  <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
            </div>
          </>
        );
      
      case 'code':
        return (
          <div className="w-full">
            <textarea
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your Rust smart contract code here..."
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
            ></textarea>
          </div>
        );
      
      case 'github':
        return (
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Repository URL</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter the URL of a public GitHub repository containing MultiversX Rust smart contracts.
            </p>
          </div>
        );
    }
  };

  const renderLoadingState = () => {
    const stages = [
      'Preparing analysis...',
      'Creating contract entry...',
      uploadMethod === 'github' ? 'Cloning GitHub repository...' : 
      uploadMethod === 'file' ? 'Uploading contract file...' : 'Processing source code...',
      'Running AI vulnerability analysis...',
      'Finalizing results...'
    ];

    return (
      <div className="bg-gray-800 p-6 rounded-lg text-white">
        <h3 className="text-xl font-semibold mb-4">Analyzing Contract</h3>
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <LoadingSpinner size="large" />
          </div>
          <p className="text-center text-xl mb-2">{loadingText || stages[loadingStage]}</p>
          <p className="text-center text-gray-400 text-sm">This may take a minute or two</p>
        </div>
        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div key={index} className={`flex items-center ${index > loadingStage ? 'opacity-40' : ''}`}>
              {index < loadingStage ? (
                <span className="text-green-400 mr-2">✓</span>
              ) : index === loadingStage ? (
                <span className="text-blue-400 animate-pulse mr-2">▶</span>
              ) : (
                <span className="text-gray-500 mr-2">○</span>
              )}
              <span>{stage}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Smart Contract</h1>
      
      {loading ? (
        renderLoadingState()
      ) : showResults ? (
        // Show analysis results
        <div>
          <div className="mb-6">
            <Button 
              onClick={() => {
                setShowResults(false);
                setContractAddress('');
                setContractName('');
                setSourceCode('');
                setRepoUrl('');
                setFile(null);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              Upload Another Contract
            </Button>
          </div>
          
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
            {success}
          </div>
          
          {/* This is where you use the ContractAnalysis component */}
          <ContractAnalysis 
            contractData={contractData} 
            analysisResults={analysisResults} 
          />
        </div>
      ) : (
        // Show upload form
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Contract Details</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Name (Optional)</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter contract name"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Address (Optional)</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter MultiversX contract address"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Upload Method</h3>
                <div className="flex flex-wrap gap-4 mb-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md ${uploadMethod === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => setUploadMethod('file')}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md ${uploadMethod === 'code' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => setUploadMethod('code')}
                  >
                    Paste Code
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md ${uploadMethod === 'github' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => setUploadMethod('github')}
                  >
                    GitHub Repository
                  </button>
                </div>
                
                {renderUploadMethod()}
              </div>
              
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              <div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                  disabled={
                    (uploadMethod === 'file' && !file) ||
                    (uploadMethod === 'code' && !sourceCode) ||
                    (uploadMethod === 'github' && !repoUrl)
                  }
                >
                  Analyze Contract
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ContractUploaderPage;
import React, { useState } from 'react';

interface Vulnerability {
  type: string;
  risk_level: string;
  explanation: string;
  recommendation: string;
  location?: string;
}

interface AnalysisResult {
  vulnerabilities: Vulnerability[];
  risk_score: number;
  is_anomaly?: boolean;
  summary?: string;
  overall_assessment?: string;
}

interface AnalysisProps {
  contractAddress?: string;
  transactionHash?: string;
  onAnalysisComplete?: (result: AnalysisResult | null) => void;
}

const AiAnalysis: React.FC<AnalysisProps> = ({ contractAddress, transactionHash, onAnalysisComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [addressOrHash, setAddressOrHash] = useState(contractAddress || transactionHash || '');
  const [analysisType, setAnalysisType] = useState(contractAddress ? 'contract' : (transactionHash ? 'transaction' : 'contract'));

  const handleAnalysisSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addressOrHash) {
      setError('Please enter a contract address or transaction hash');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = '';
      let payload = {};
      
      if (analysisType === 'contract') {
        endpoint = '/api/ai-analysis/contract';
        payload = { contractAddress: addressOrHash };
      } else {
        endpoint = '/api/ai-analysis/transaction';
        payload = { transactionHash: addressOrHash };
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze');
      }
      
      const data = await response.json();
      setAnalysis(data.analysis);
      if (onAnalysisComplete) {
        onAnalysisComplete(data.analysis);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Get the color for the risk level badge
  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get the color for the risk score
  const getRiskScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">AI Security Analysis</h2>
      
      <form onSubmit={handleAnalysisSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Analysis Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="contract"
                checked={analysisType === 'contract'}
                onChange={() => setAnalysisType('contract')}
                className="mr-2"
              />
              Contract
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="transaction"
                checked={analysisType === 'transaction'}
                onChange={() => setAnalysisType('transaction')}
                className="mr-2"
              />
              Transaction
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {analysisType === 'contract' ? 'Contract Address' : 'Transaction Hash'}
          </label>
          <input
            type="text"
            value={addressOrHash}
            onChange={(e) => setAddressOrHash(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={analysisType === 'contract' ? 'Enter contract address' : 'Enter transaction hash'}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze with AI'}
        </button>
      </form>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {analysis && (
        <div className="space-y-6">
          {/* Risk Score */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
            <div>
              <h3 className="font-medium">Risk Score</h3>
              <p className={`text-3xl font-bold ${getRiskScoreColor(analysis.risk_score)}`}>
                {analysis.risk_score}/100
              </p>
            </div>
            
            {/* Circular progress indicator */}
            <div className="relative h-20 w-20">
              <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={analysis.risk_score >= 75 ? '#ef4444' : analysis.risk_score >= 50 ? '#f97316' : analysis.risk_score >= 25 ? '#eab308' : '#22c55e'}
                  strokeWidth="3"
                  strokeDasharray={`${analysis.risk_score}, 100`}
                />
              </svg>
            </div>
          </div>
          
          {/* Summary */}
          {(analysis.summary || analysis.overall_assessment) && (
            <div>
              <h3 className="font-medium mb-2">Summary</h3>
              <p className="text-gray-700">
                {analysis.summary || analysis.overall_assessment}
              </p>
            </div>
          )}
          
          {/* Vulnerabilities */}
          <div>
            <h3 className="font-medium mb-2">Detected Vulnerabilities</h3>
            
            {analysis.vulnerabilities.length === 0 ? (
              <p className="text-green-600">No vulnerabilities detected</p>
            ) : (
              <div className="space-y-4">
                {analysis.vulnerabilities.map((vuln, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{vuln.type}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(vuln.risk_level)}`}>
                        {vuln.risk_level}
                      </span>
                    </div>
                    
                    {vuln.location && (
                      <p className="text-sm text-gray-500 mb-2">
                        <strong>Location:</strong> {vuln.location}
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-700 mb-2">{vuln.explanation}</p>
                    
                    <div className="text-sm bg-blue-50 p-2 rounded">
                      <strong>Recommendation:</strong> {vuln.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Anomaly */}
          {analysis.is_anomaly && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700">
                <strong>Note:</strong> This transaction shows anomalous patterns compared to typical blockchain activity.
              </p>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-4">
            <p>AI analysis powered by Google Gemini 1.5 Flash</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAnalysis;
import React, { useState } from 'react';

// Define vulnerability patterns
const vulnerabilityPatterns = [
  {
    id: 'reentrancy',
    name: 'Reentrancy Attack Pattern',
    description: 'Detects the potential for reentrancy vulnerabilities, where an external contract can recursively call back into the vulnerable contract before the first invocation is complete.',
    severity: 'critical',
    searchPatterns: [
      'transfer.*call',
      'transfer[\\s\\S]*external',
      'send.*before.*state',
      'call.*value'
    ]
  },
  {
    id: 'integer-overflow',
    name: 'Integer Overflow/Underflow',
    description: 'Identifies potential integer overflow or underflow vulnerabilities, where arithmetic operations can wrap around due to fixed-size integer types.',
    severity: 'high',
    searchPatterns: [
      '\\.add\\(',
      '\\.sub\\(',
      '\\.mul\\(',
      'without.*check',
      '[^safe]Math\\.', 
      '\\+\\+[^+]',
      '\\-\\-[^-]'
    ]
  },
  {
    id: 'access-control',
    name: 'Access Control Issues',
    description: 'Detects missing or insufficient access controls that might allow unauthorized users to access privileged functions.',
    severity: 'high',
    searchPatterns: [
      'onlyOwner',
      'require\\(.*==.*owner',
      'onlyRole',
      'permissions',
      'auth[\\s\\S]*check'
    ]
  },
  {
    id: 'timestamp-dependence',
    name: 'Timestamp Dependence',
    description: 'Identifies reliance on block timestamps which can be manipulated by miners within certain bounds.',
    severity: 'medium',
    searchPatterns: [
      'block\\.timestamp',
      'now\\s',
      'currentTime',
      'getTimestamp'
    ]
  },
  {
    id: 'unchecked-return',
    name: 'Unchecked Return Values',
    description: 'Detects when return values from external calls or contract functions are not properly checked.',
    severity: 'medium',
    searchPatterns: [
      'transfer\\([^;]*\\);',
      'send\\([^;]*\\);',
      '\\.call\\([^;]*\\);',
      'address\\(\\)\\.call'
    ]
  },
  {
    id: 'front-running',
    name: 'Front-Running Vulnerability',
    description: 'Identifies patterns that might be susceptible to front-running attacks, where miners or other users can observe pending transactions and insert their own transactions ahead.',
    severity: 'medium',
    searchPatterns: [
      'reveal',
      'commit.*reveal',
      'price.*update',
      'order.*book'
    ]
  },
  {
    id: 'dos',
    name: 'Denial of Service',
    description: 'Detects patterns that might lead to denial of service attacks, where contract execution can be blocked or severely impaired.',
    severity: 'medium',
    searchPatterns: [
      'for.*loop',
      'while',
      'unbounded.*loop',
      'require\\(.*length'
    ]
  }
];

interface PatternDetectionProps {
  contractCode: string;
  onPatternDetectionComplete?: (results: any[] | null) => void;
}

const PatternDetection: React.FC<PatternDetectionProps> = ({ contractCode, onPatternDetectionComplete }) => {
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to detect patterns in code
  const detectPatterns = () => {
    if (!contractCode.trim()) {
      return;
    }

    setLoading(true);
    
    // Simulate a brief loading period (would be replaced with actual API call in production)
    setTimeout(() => {
      const detectedIssues = [];
      
      // Check each vulnerability pattern
      for (const pattern of vulnerabilityPatterns) {
        const matches = [];
        
        // Check each search pattern within this vulnerability
        for (const searchPattern of pattern.searchPatterns) {
          try {
            const regex = new RegExp(searchPattern, 'gi');
            const patternMatches = [...contractCode.matchAll(regex)];
            
            if (patternMatches.length > 0) {
              // Find line numbers for matches
              for (const match of patternMatches) {
                if (match.index !== undefined) {
                  // Calculate line number based on index
                  const lineNumber = contractCode.substring(0, match.index).split('\n').length;
                  matches.push({
                    text: match[0],
                    lineNumber
                  });
                }
              }
            }
          } catch (error) {
            console.error(`Error with regex ${searchPattern}:`, error);
          }
        }
        
        if (matches.length > 0) {
          detectedIssues.push({
            ...pattern,
            matches
          });
        }
      }
      
      setResults(detectedIssues);
      if (onPatternDetectionComplete) {
        onPatternDetectionComplete(detectedIssues);
      }
      setLoading(false);
    }, 1000);
  };

  // Get color for severity badge
  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Pattern-Based Vulnerability Detection</h2>
      <p className="text-gray-600 mb-6">
        Paste your smart contract code below to detect common vulnerability patterns
      </p>
      
      <div className="mb-6">
        <textarea
          className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
          placeholder="Paste your smart contract code here..."
          value={contractCode}
          // Remove the onChange handler as contractCode is a prop
        />
      </div>
      
      <div className="mb-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          onClick={detectPatterns}
          disabled={loading || !contractCode.trim()}
        >
          {loading ? 'Analyzing...' : 'Analyze Code'}
        </button>
      </div>
      
      {results && (
        <div className="mt-6">
          <h3 className="font-medium text-lg mb-4">
            {results.length === 0 ? 'No patterns detected' : `Detected Patterns (${results.length})`}
          </h3>
          
          {results.length === 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                No known vulnerability patterns were detected in the provided code. However, this does 
                not guarantee that the code is free from all vulnerabilities. We recommend combining pattern 
                detection with AI analysis and manual review.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-md">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h4 className="font-medium">{result.name}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(result.severity)}`}>
                      {result.severity}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 mb-4">{result.description}</p>
                    
                    <h5 className="text-sm font-medium mb-2">Detected Instances:</h5>
                    <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                      {result.matches.map((match: any, i: number) => (
                        <div key={i} className="mb-2">
                          <span className="text-gray-500">Line {match.lineNumber}:</span> {match.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800">
                  <strong>Note:</strong> Pattern detection uses regular expressions to identify potential vulnerability 
                  patterns and may produce false positives. Always review findings manually and consider using the AI Analysis 
                  for more context-aware detection.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatternDetection;
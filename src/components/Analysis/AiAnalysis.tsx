import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface AiAnalysisProps {
  contractAddress: string;
}

const AiAnalysis: React.FC<AiAnalysisProps> = ({ contractAddress }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [securityScore, setSecurityScore] = useState<number>(0);
  
  // Mock AI analysis generation
  useEffect(() => {
    const generateAnalysis = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate analysis based on contract address
      let analysisText = '';
      let score = 0;
      
      if (contractAddress.includes('qgg')) {
        // Lending Protocol
        analysisText = `### MultiversX AI Smart Contract Sentinel Analysis

The lending protocol smart contract at address \`${contractAddress}\` has been analyzed for security vulnerabilities.

**Critical Issues Detected:**
- A potential reentrancy vulnerability has been identified in the \`withdrawFunds()\` function. The contract does not follow the checks-effects-interactions pattern, making it vulnerable to reentrancy attacks. This is a high-severity issue that should be addressed immediately.

**Security Recommendations:**
1. Implement a reentrancy guard modifier
2. Update the withdraw function to follow checks-effects-interactions pattern
3. Consider using the OpenZeppelin ReentrancyGuard pattern

**Code Analysis:**
The contract implements a lending protocol with collateralization features. The vulnerability exists in the withdrawal logic where the external call is made before state changes are applied. This pattern is known to be vulnerable to reentrancy attacks.

**Transaction Analysis:**
Historical transaction data shows normal usage patterns for lending and borrowing, with no evidence of exploitation attempts so far.`;
        score = 35;
      } else if (contractAddress.includes('2twr')) {
        // NFT Marketplace
        analysisText = `### MultiversX AI Smart Contract Sentinel Analysis

The NFT marketplace contract at address \`${contractAddress}\` has been analyzed for security vulnerabilities.

**High Severity Issues Detected:**
- Access control vulnerability found in the administrative function that manages permissions. This could allow unauthorized users to gain privileged access.
- Suspicious token transfer patterns detected that may indicate a potential exploit vector.

**Security Recommendations:**
1. Implement proper authentication checks in all administrative functions
2. Add role-based access control (RBAC) for sensitive operations
3. Conduct additional transaction monitoring for unusual transfer patterns

**Code Analysis:**
The contract implements an NFT marketplace with auction and direct sale capabilities. The vulnerability exists in the permission management logic where proper authentication checks are missing.

**Transaction Analysis:**
Transaction history shows some unusual patterns of small value transfers that may warrant additional investigation.`;
        score = 65;
      } else if (contractAddress.includes('wxzc')) {
        // ElrondSwap
        analysisText = `### MultiversX AI Smart Contract Sentinel Analysis

The ElrondSwap smart contract at address \`${contractAddress}\` has been analyzed for security vulnerabilities.

**Security Overview:**
No critical or high severity issues were detected in the current version of the contract. The code follows security best practices including proper input validation, secure arithmetic operations, and appropriate access controls.

**Minor Considerations:**
- The contract relies heavily on external price oracles which could be a point of centralization
- Some functions have high gas costs that could be optimized

**Code Analysis:**
The contract implements a decentralized exchange with liquidity pools and automated market maker functionality. No significant vulnerabilities were identified in the implementation.

**Transaction Analysis:**
Transaction patterns appear normal with expected liquidity additions, removals, and swap operations.`;
        score = 92;
      } else if (contractAddress.includes('kepz')) {
        // Swap Protocol
        analysisText = `### MultiversX AI Smart Contract Sentinel Analysis

The swap protocol smart contract at address \`${contractAddress}\` has been analyzed for security vulnerabilities.

**Medium Severity Issues Detected:**
- Suspicious token transfer patterns that may indicate a potential token manipulation vector
- Potential issues with slippage protection that could lead to front-running

**Security Recommendations:**
1. Implement improved slippage protection mechanisms
2. Add additional validation for token transfers
3. Consider implementing a timelock for critical parameter changes

**Code Analysis:**
The contract implements a token swap protocol with liquidity pools. While no critical issues were found, there are some medium-risk patterns in the implementation that should be addressed.

**Transaction Analysis:**
Transaction history shows some unusual patterns that may indicate attempted price manipulation, though no successful exploits were detected.`;
        score = 75;
      } else {
        // Generic analysis
        analysisText = `### MultiversX AI Smart Contract Sentinel Analysis

The smart contract at address \`${contractAddress}\` has been analyzed for security vulnerabilities.

**Security Overview:**
Based on static analysis and transaction pattern monitoring, no immediate security concerns were identified. However, a comprehensive manual audit is still recommended for critical applications.

**Recommendations:**
1. Implement additional monitoring for unusual transaction patterns
2. Consider a full security audit by specialized security researchers
3. Follow MultiversX security best practices for contract upgrades

**Code Analysis:**
The contract implements standard functionality with no obvious security vulnerabilities in the code reviewed.

**Transaction Analysis:**
Transaction patterns appear normal with no suspicious activity detected.`;
        score = Math.floor(Math.random() * 30) + 70; // Random score between 70-99
      }
      
      setAnalysis(analysisText);
      setSecurityScore(score);
      setIsLoading(false);
    };
    
    generateAnalysis();
  }, [contractAddress]);
  
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    if (score >= 50) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <LoadingSpinner />
          <span className="ml-2">Generating AI analysis...</span>
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-4">
            <div className={`${getScoreBackground(securityScore)} p-3 rounded-md flex items-center mr-4`}>
              <span className="text-gray-700 mr-2">Security Score:</span>
              <span className={`text-2xl font-bold ${getScoreColorClass(securityScore)}`}>{securityScore}</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                AI-powered security analysis evaluates contract code and transaction patterns to identify potential vulnerabilities.
              </p>
            </div>
          </div>
          
          <div className="prose max-w-none bg-gray-50 p-4 rounded-md overflow-auto">
            {analysis.split('\n').map((line, index) => {
              if (line.startsWith('###')) {
                return <h3 key={index} className="text-xl font-bold mt-0">{line.replace('###', '')}</h3>;
              } else if (line.startsWith('**')) {
                return <p key={index} className="font-bold">{line}</p>;
              } else if (line.startsWith('-')) {
                return <li key={index} className="ml-4">{line.substring(2)}</li>;
              } else if (line.match(/^\d+\./)) {
                return <li key={index} className="ml-4">{line.substring(line.indexOf('.') + 1)}</li>;
              } else if (line.trim() === '') {
                return <br key={index} />;
              } else {
                return <p key={index}>{line}</p>;
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAnalysis;
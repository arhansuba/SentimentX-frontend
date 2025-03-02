// src/components/Dashboard/ContractOverview.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LinearProgress, Typography, Box, Chip } from '@mui/material';
import { SecurityOutlined, WarningAmber } from '@mui/icons-material';

interface ContractProps {
  contract: any;
  className?: string;
}

const ContractOverview: React.FC<ContractProps> = ({ contract, className = '' }) => {
  // Function to calculate security score color
  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  // Function to format contract address for display
  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold">{contract.name || 'Unnamed Contract'}</h3>
            {contract.alertCount > 0 && (
              <Chip 
                label={`${contract.alertCount} Alert${contract.alertCount !== 1 ? 's' : ''}`}
                color={contract.highRiskAlerts > 0 ? 'error' : 'warning'}
                size="small"
                icon={<WarningAmber />}
                className="ml-2"
              />
            )}
          </div>
          
          <div className="text-sm text-gray-500 mt-1">
            <a 
              href={`https://explorer.multiversx.com/address/${contract.address}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 underline underline-offset-2"
            >
              {formatAddress(contract.address)}
            </a>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
            <div>
              <span className="font-medium">Last Activity:</span> {formatDate(contract.lastActivityDate)}
            </div>
            {contract.deploymentTransaction && (
              <div>
                <span className="font-medium">TX:</span>{' '}
                <a 
                  href={`https://explorer.multiversx.com/transactions/${contract.deploymentTransaction}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 underline underline-offset-2"
                >
                  {contract.deploymentTransaction.substring(0, 8)}...
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:items-end">
          <div className="flex items-center mb-2">
            <SecurityOutlined 
              fontSize="small" 
              color={getSecurityScoreColor(contract.securityScore)} 
              className="mr-1"
            />
            <Typography variant="subtitle2">
              Security Score: {contract.securityScore}/100
            </Typography>
          </div>
          
          <Box sx={{ width: '100%', maxWidth: 250 }}>
            <LinearProgress 
              variant="determinate" 
              value={contract.securityScore} 
              color={getSecurityScoreColor(contract.securityScore)}
              sx={{ 
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }}
            />
          </Box>
          
          <div className="mt-4">
            <Link
              to={`/contracts/${contract.id}`}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
            >
              View Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractOverview;
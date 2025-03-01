import React from 'react';
import SecurityScore from './SecurityScore';

interface Contract {
  address: string;
  name: string;
  securityScore: number;
  alertCount: number;
  highRiskAlerts: number;
}

interface ContractOverviewProps {
  contract: Contract[];
}

const ContractOverview: React.FC<ContractOverviewProps> = ({ contract }) => {
  // Function to truncate the address for display
  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      {contract.map((c) => (
        <div key={c.address} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            {/* Contract info */}
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium">{c.name}</h3>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500">{truncateAddress(c.address)}</span>
                <button
                  className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
                  onClick={() => navigator.clipboard.writeText(c.address)}
                  title="Copy address"
                >
                  Copy
                </button>
              </div>
              
              {/* Alert stats */}
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-sm">{c.alertCount} Alerts</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">{c.highRiskAlerts} High Risk</span>
                </div>
              </div>
            </div>
            
            {/* Security score */}
            <div className="flex items-center">
              <SecurityScore score={c.securityScore} size="sm" />
              
              <div className="ml-6 space-y-2">
                <button
                  className="block w-full px-3 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Analyze
                </button>
                
                <button
                  className="block w-full px-3 py-1.5 text-xs font-medium text-center text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  View Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ContractOverview;
import api from './api';

// Define possible commands
export const COMMANDS = {
  // Analysis commands
  ANALYZE: '/analyze',
  ANALYZE_CODE: '/analyze-code',
  ANALYZE_REPO: '/analyze-repo',
  
  // Contract commands
  LIST_CONTRACTS: '/contracts',
  VIEW_CONTRACT: '/contract',
  DELETE_CONTRACT: '/delete',
  
  // Alert commands
  LIST_ALERTS: '/alerts',
  HIGH_RISK_ALERTS: '/high-risk',
  VIEW_ALERT: '/alert',
  RESOLVE_ALERT: '/resolve',
  ALERT_STATS: '/alert-stats',
  
  // Transaction commands
  LIST_TRANSACTIONS: '/transactions',
  HIGH_RISK_TRANSACTIONS: '/high-risk-tx',
  VIEW_TRANSACTION: '/transaction',
  CONTRACT_TRANSACTIONS: '/contract-tx',
  
  // Metrics commands
  METRICS: '/metrics',
  CACHE_METRICS: '/cache-metrics',
  
  // Utility commands
  HELP: '/help',
  UPLOAD: '/upload',
};

// Command handler
export async function executeCommand(command: string, args: string = '') {
  const cmd = command.toLowerCase().trim();
  
  switch(cmd) {
    // Contract commands
    case COMMANDS.LIST_CONTRACTS:
      return await fetchContracts();
    case COMMANDS.VIEW_CONTRACT:
      if (!args) return "Please provide a contract address. Usage: /contract [address]";
      return await fetchContractDetails(args);
    case COMMANDS.DELETE_CONTRACT:
      if (!args) return "Please provide a contract address. Usage: /delete [address]";
      return await deleteContract(args);
    
    // Alert commands
    case COMMANDS.LIST_ALERTS:
      return await fetchAlerts();
    case COMMANDS.HIGH_RISK_ALERTS:
      return await fetchHighRiskAlerts();
    case COMMANDS.VIEW_ALERT:
      if (!args) return "Please provide an alert ID. Usage: /alert [id]";
      return await fetchAlertDetails(args);
    case COMMANDS.RESOLVE_ALERT:
      if (!args) return "Please provide an alert ID. Usage: /resolve [id]";
      return await resolveAlert(args);
    case COMMANDS.ALERT_STATS:
      return await fetchAlertStats();
    
    // Transaction commands
    case COMMANDS.LIST_TRANSACTIONS:
      return await fetchTransactions();
    case COMMANDS.HIGH_RISK_TRANSACTIONS:
      return await fetchHighRiskTransactions();
    case COMMANDS.VIEW_TRANSACTION:
      if (!args) return "Please provide a transaction hash. Usage: /transaction [hash]";
      return await fetchTransactionDetails(args);
    case COMMANDS.CONTRACT_TRANSACTIONS:
      if (!args) return "Please provide a contract address. Usage: /contract-tx [address]";
      return await fetchContractTransactions(args);
    
    // Metrics commands
    case COMMANDS.METRICS:
      return await fetchMetrics();
    case COMMANDS.CACHE_METRICS:
      return await fetchCacheMetrics();
    
    // Help command
    case COMMANDS.HELP:
      return generateHelpText();
    
    default:
      return `Unknown command: ${command}. Type /help to see available commands.`;
  }
}

// Contract API handlers
async function fetchContracts() {
  try {
    const response = await api.get('/contracts');
    const contracts = response.data.contracts || [];
    
    if (contracts.length === 0) {
      return "No contracts found. Upload a contract with `/upload` or paste code directly.";
    }
    
    let result = "## Monitored Contracts\n\n";
    contracts.forEach((contract: any, index: number) => {
      result += `**${index+1}. ${contract.name || 'Unnamed Contract'}**\n`;
      result += `- Address: \`${contract.address}\`\n`;
      result += `- Security Score: ${contract.securityScore}/100\n`;
      result += `- Alerts: ${contract.alertCount} (${contract.highRiskAlerts} high risk)\n\n`;
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return "Failed to fetch contracts. Please try again later.";
  }
}

async function fetchContractDetails(address: string) {
  try {
    const response = await api.get(`/contracts/${address}/health`);
    const health = response.data.securityHealth || {};
    
    let result = `## Contract Details: ${address.substring(0, 10)}...\n\n`;
    result += `- Total Alerts: ${health.totalAlerts || 0}\n`;
    result += `- Open Alerts: ${health.openAlerts || 0}\n`;
    result += `- High Risk Issues: ${health.highRiskAlerts || 0}\n`;
    result += `- Security Score: ${health.averageSecurityScore || 'N/A'}/100\n\n`;
    
    result += "### Top Vulnerabilities:\n\n";
    if (health.topVulnerabilities && health.topVulnerabilities.length > 0) {
      health.topVulnerabilities.forEach((vuln: any, index: number) => {
        result += `${index+1}. ${vuln.id}: ${vuln.count} instances\n`;
      });
    } else {
      result += "No vulnerabilities detected.\n";
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching contract details:', error);
    return `Failed to fetch details for contract ${address}. Please verify the address is correct.`;
  }
}

async function deleteContract(address: string) {
  try {
    await api.delete(`/contracts/${address}`);
    return `Contract ${address} has been removed from monitoring.`;
  } catch (error) {
    console.error('Error deleting contract:', error);
    return `Failed to delete contract ${address}. Please try again later.`;
  }
}

// Alert API handlers
async function fetchAlerts() {
  try {
    const response = await api.get('/alerts');
    const alerts = response.data.alerts || [];
    
    if (alerts.length === 0) {
      return "No alerts found.";
    }
    
    let result = "## Security Alerts\n\n";
    alerts.forEach((alert: any, index: number) => {
      result += `**${index+1}. ${alert.vulnerabilityType || 'Unknown Vulnerability'}** (${alert.riskLevel})\n`;
      result += `- Contract: ${alert.contractName}\n`;
      result += `- Status: ${alert.status}\n`;
      result += `- Detected: ${new Date(alert.timestamp).toLocaleString()}\n\n`;
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return "Failed to fetch alerts. Please try again later.";
  }
}

async function fetchHighRiskAlerts() {
  try {
    const response = await api.get('/alerts/high-risk');
    const alerts = response.data.alerts || [];
    
    if (alerts.length === 0) {
      return "No high-risk alerts found.";
    }
    
    let result = "## High Risk Security Alerts\n\n";
    alerts.forEach((alert: any, index: number) => {
      result += `**${index+1}. ${alert.vulnerabilityType || 'Unknown Vulnerability'}**\n`;
      result += `- Contract: ${alert.contractName}\n`;
      result += `- Status: ${alert.status}\n`;
      result += `- Detected: ${new Date(alert.timestamp).toLocaleString()}\n\n`;
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching high-risk alerts:', error);
    return "Failed to fetch high-risk alerts. Please try again later.";
  }
}

async function fetchAlertDetails(id: string) {
  try {
    const response = await api.get(`/alerts/${id}`);
    const alert = response.data.alert || {};
    
    let result = `## Alert Details: ${id}\n\n`;
    result += `**${alert.vulnerabilityType || 'Unknown Vulnerability'}** (${alert.riskLevel})\n\n`;
    result += `- Contract: ${alert.contractName}\n`;
    result += `- Address: \`${alert.contractAddress}\`\n`;
    result += `- Status: ${alert.status}\n`;
    result += `- Detected: ${new Date(alert.timestamp).toLocaleString()}\n\n`;
    
    if (alert.description) {
      result += `### Description\n${alert.description}\n\n`;
    }
    
    if (alert.affectedCode) {
      result += `### Affected Code\n\`\`\`rust\n${alert.affectedCode}\n\`\`\`\n\n`;
    }
    
    if (alert.remediationSteps) {
      result += `### Remediation Steps\n${alert.remediationSteps}\n\n`;
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching alert details:', error);
    return `Failed to fetch details for alert ${id}. Please verify the ID is correct.`;
  }
}

async function resolveAlert(id: string) {
  try {
    await api.post(`/alerts/${id}/resolve`);
    return `Alert ${id} has been marked as resolved.`;
  } catch (error) {
    console.error('Error resolving alert:', error);
    return `Failed to resolve alert ${id}. Please try again later.`;
  }
}

async function fetchAlertStats() {
  try {
    const response = await api.get('/alerts/stats/summary');
    const stats = response.data.stats || {};
    
    let result = "## Alert Statistics\n\n";
    result += `- Total Alerts: ${stats.totalAlerts || 0}\n`;
    result += `- Open Alerts: ${stats.openAlerts || 0}\n`;
    result += `- Resolved Alerts: ${stats.resolvedAlerts || 0}\n\n`;
    
    result += "### By Risk Level\n\n";
    result += `- High Risk: ${stats.highRiskCount || 0}\n`;
    result += `- Medium Risk: ${stats.mediumRiskCount || 0}\n`;
    result += `- Low Risk: ${stats.lowRiskCount || 0}\n\n`;
    
    return result;
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    return "Failed to fetch alert statistics. Please try again later.";
  }
}

// Transaction API handlers
async function fetchTransactions() {
  try {
    const response = await api.get('/transactions');
    const transactions = response.data.transactions || [];
    
    if (transactions.length === 0) {
      return "No transactions found.";
    }
    
    let result = "## Recent Transactions\n\n";
    transactions.forEach((tx: any, index: number) => {
      result += `**${index+1}. ${tx.hash.substring(0, 10)}...**\n`;
      result += `- Contract: ${tx.contractName || tx.address}\n`;
      result += `- Status: ${tx.status}\n`;
      result += `- Timestamp: ${new Date(tx.timestamp).toLocaleString()}\n\n`;
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return "Failed to fetch transactions. Please try again later.";
  }
}

async function fetchHighRiskTransactions() {
  try {
    const response = await api.get('/transactions/high-risk');
    const transactions = response.data.transactions || [];
    
    if (transactions.length === 0) {
      return "No high-risk transactions found.";
    }
    
    let result = "## High Risk Transactions\n\n";
    transactions.forEach((tx: any, index: number) => {
      result += `**${index+1}. ${tx.hash.substring(0, 10)}...**\n`;
      result += `- Contract: ${tx.contractName || tx.address}\n`;
      result += `- Risk Factors: ${tx.riskFactors.join(', ')}\n`;
      result += `- Timestamp: ${new Date(tx.timestamp).toLocaleString()}\n\n`;
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching high-risk transactions:', error);
    return "Failed to fetch high-risk transactions. Please try again later.";
  }
}

async function fetchTransactionDetails(hash: string) {
  try {
    const response = await api.get(`/transactions/${hash}`);
    const tx = response.data.transaction || {};
    
    let result = `## Transaction Details: ${hash.substring(0, 10)}...\n\n`;
    result += `- Contract: ${tx.contractName || tx.address}\n`;
    result += `- Status: ${tx.status}\n`;
    result += `- Timestamp: ${new Date(tx.timestamp).toLocaleString()}\n\n`;
    
    if (tx.methodName) {
      result += `- Method: ${tx.methodName}\n`;
    }
    
    if (tx.value) {
      result += `- Value: ${tx.value}\n`;
    }
    
    if (tx.gasUsed) {
      result += `- Gas Used: ${tx.gasUsed}\n`;
    }
    
    if (tx.data) {
      result += `\n### Transaction Data\n\`\`\`\n${tx.data}\n\`\`\`\n\n`;
    }
    
    if (tx.securityAnalysis) {
      result += `\n### Security Analysis\n`;
      result += `- Risk Level: ${tx.securityAnalysis.riskLevel}\n`;
      
      if (tx.securityAnalysis.findings && tx.securityAnalysis.findings.length > 0) {
        result += `\n#### Findings\n`;
        tx.securityAnalysis.findings.forEach((finding: any, index: number) => {
          result += `${index+1}. ${finding.description}\n`;
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return `Failed to fetch details for transaction ${hash}. Please verify the hash is correct.`;
  }
}

async function fetchContractTransactions(address: string) {
  try {
    const response = await api.get(`/transactions/contract/${address}`);
    const transactions = response.data.transactions || [];
    
    if (transactions.length === 0) {
      return `No transactions found for contract ${address}.`;
    }
    
    let result = `## Transactions for Contract: ${address.substring(0, 10)}...\n\n`;
    transactions.forEach((tx: any, index: number) => {
      result += `**${index+1}. ${tx.hash.substring(0, 10)}...**\n`;
      result += `- Status: ${tx.status}\n`;
      if (tx.methodName) {
        result += `- Method: ${tx.methodName}\n`;
      }
      result += `- Timestamp: ${new Date(tx.timestamp).toLocaleString()}\n\n`;
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching contract transactions:', error);
    return `Failed to fetch transactions for contract ${address}. Please verify the address is correct.`;
  }
}

// Metrics API handlers
async function fetchMetrics() {
  try {
    const response = await api.get('/metrics');
    const metrics = response.data.metrics || {};
    
    let result = "## System Metrics\n\n";
    result += `- API Requests: ${metrics.apiRequests || 0}\n`;
    result += `- Contracts Monitored: ${metrics.contractsMonitored || 0}\n`;
    result += `- Alerts Generated: ${metrics.alertsGenerated || 0}\n`;
    result += `- Transactions Processed: ${metrics.transactionsProcessed || 0}\n\n`;
    
    if (metrics.responseTime) {
      result += `- Average Response Time: ${metrics.responseTime.avg || 0}ms\n`;
      result += `- Max Response Time: ${metrics.responseTime.max || 0}ms\n\n`;
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return "Failed to fetch system metrics. Please try again later.";
  }
}

async function fetchCacheMetrics() {
  try {
    const response = await api.get('/metrics/cache');
    const cacheMetrics = response.data.cacheMetrics || {};
    
    let result = "## Cache Metrics\n\n";
    result += `- Cache Hit Rate: ${cacheMetrics.hitRate || 0}%\n`;
    result += `- Cache Size: ${cacheMetrics.size || 0} entries\n`;
    result += `- Cache Memory Usage: ${cacheMetrics.memoryUsage || 0} MB\n\n`;
    
    return result;
  } catch (error) {
    console.error('Error fetching cache metrics:', error);
    return "Failed to fetch cache metrics. Please try again later.";
  }
}

// Generate help text
function generateHelpText() {
  return `## Available Commands

**Code Analysis**
- Just paste any MultiversX smart contract code to analyze it
- \`/analyze-code\` - Analyze code snippet via prompt
- \`/analyze-repo\` - Analyze code from a GitHub repository

**Contract Management**
- \`/contracts\` - List all monitored contracts
- \`/contract [address]\` - View details for a specific contract
- \`/delete [address]\` - Remove a contract from monitoring

**Security Alerts**
- \`/alerts\` - View all security alerts
- \`/high-risk\` - View only high-risk alerts
- \`/alert [id]\` - View details for a specific alert
- \`/resolve [id]\` - Mark an alert as resolved
- \`/alert-stats\` - View alert statistics

**Transaction Monitoring**
- \`/transactions\` - View recent transactions
- \`/high-risk-tx\` - View high-risk transactions
- \`/transaction [hash]\` - View details for a specific transaction
- \`/contract-tx [address]\` - View transactions for a specific contract

**System Metrics**
- \`/metrics\` - View system performance metrics
- \`/cache-metrics\` - View cache performance metrics

**Other Commands**
- \`/help\` - Show this help message
- \`/upload\` - Upload a contract file for analysis (or drag and drop)
`;
}

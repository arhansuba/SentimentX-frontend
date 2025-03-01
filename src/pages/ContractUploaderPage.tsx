import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  AlertTitle
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CloudUpload as CloudUploadIcon,
  Warning as WarningIcon,
  Code as CodeIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

// Styled components
const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  textAlign: 'center',
  border: `2px dashed ${theme.palette.divider}`,
  cursor: 'pointer',
  transition: 'all 0.3s',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover
  }
}));

const ResultPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3)
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Mock vulnerabilities for demonstration
const mockVulnerabilities = [
  {
    id: 1,
    severity: 'high',
    name: 'Reentrancy Vulnerability',
    description: 'Contract allows external calls before state updates, enabling potential reentrancy attacks.',
    line: 42,
    code: 'function withdrawFunds() public {\n  uint amount = balances[msg.sender];\n  (bool success, ) = msg.sender.call{value: amount}("");\n  require(success, "Transfer failed");\n  balances[msg.sender] = 0;\n}',
    recommendation: 'Apply checks-effects-interactions pattern: update state before external calls.'
  },
  {
    id: 2,
    severity: 'medium',
    name: 'Timestamp Dependence',
    description: 'Contract uses block.timestamp as part of its critical logic which can be manipulated by miners.',
    line: 86,
    code: 'if (block.timestamp >= endTime) {\n  // Distribute tokens\n}',
    recommendation: 'Avoid relying on block.timestamp for critical logic or implement a buffer period.'
  },
  {
    id: 3,
    severity: 'low',
    name: 'Floating Pragma',
    description: 'Contract uses a floating pragma which may compile with a newer compiler version with unexpected behaviors.',
    line: 1,
    code: 'pragma solidity ^0.8.0;',
    recommendation: 'Lock the pragma to a specific version: pragma solidity 0.8.9;'
  }
];

const ContractUploaderPage = () => {
  const [contractSource, setContractSource] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setContractSource(e.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      setSelectedFile(file);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setContractSource(e.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAnalyze = () => {
    if (!contractSource && !contractAddress) {
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Smart Contract Analyzer
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Upload your MultiversX smart contract or provide a contract address to analyze for security vulnerabilities.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Contract Code
            </Typography>
            
            <UploadBox
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".rs,.py,.sol,.txt"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">
                Drag & Drop Contract File
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse
              </Typography>
              {selectedFile && (
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={selectedFile.name} 
                    color="primary" 
                    onDelete={() => setSelectedFile(null)}
                  />
                </Box>
              )}
            </UploadBox>
            
            <Typography variant="subtitle2" gutterBottom>
              Contract Source Code:
            </Typography>
            <TextField
              multiline
              rows={10}
              fullWidth
              variant="outlined"
              placeholder="Paste your contract source code here..."
              value={contractSource}
              onChange={(e) => setContractSource(e.target.value)}
              sx={{ mb: 3, fontFamily: 'monospace' }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contract Address
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Alternatively, enter a MultiversX contract address to analyze
            </Typography>
            
            <TextField
              fullWidth
              label="Contract Address"
              placeholder="erd1qqqqqqqqqqqqqpgq..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!contractSource && !contractAddress)}
              fullWidth
              startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Contract'}
            </Button>
          </Paper>
          
          {analysisComplete && (
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small">
                  View Details
                </Button>
              }
            >
              Analysis complete! {mockVulnerabilities.length} vulnerabilities detected.
            </Alert>
          )}
        </Grid>
      </Grid>

      {analysisComplete && (
        <ResultPaper elevation={3}>
          <Typography variant="h5" gutterBottom>
            Analysis Results
          </Typography>
          
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="analysis tabs">
            <Tab label="Vulnerabilities" icon={<WarningIcon />} iconPosition="start" />
            <Tab label="Code Review" icon={<CodeIcon />} iconPosition="start" />
            <Tab label="Performance" icon={<SpeedIcon />} iconPosition="start" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <AlertTitle>Security Analysis</AlertTitle>
                Found {mockVulnerabilities.filter(v => v.severity === 'high').length} high, {mockVulnerabilities.filter(v => v.severity === 'medium').length} medium, and {mockVulnerabilities.filter(v => v.severity === 'low').length} low severity issues.
              </Alert>
              
              {mockVulnerabilities.map((vuln) => (
                <Paper key={vuln.id} sx={{ p: 2, mb: 2, borderLeft: 4, borderColor: `${getSeverityColor(vuln.severity)}.main` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={vuln.severity.toUpperCase()} 
                      color={getSeverityColor(vuln.severity) as any} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="h6">{vuln.name}</Typography>
                  </Box>
                  
                  <Typography variant="body2" paragraph>
                    {vuln.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Vulnerable Code (Line {vuln.line}):
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                    <pre style={{ margin: 0, overflow: 'auto' }}>
                      <code>{vuln.code}</code>
                    </pre>
                  </Paper>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Recommendation:
                  </Typography>
                  <Typography variant="body2">
                    {vuln.recommendation}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="subtitle1" gutterBottom>
              Code Quality Analysis
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>
              Code review content will be displayed here.
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="subtitle1" gutterBottom>
              Performance Analysis
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography>
              Performance metrics will be displayed here.
            </Typography>
          </TabPanel>
        </ResultPaper>
      )}
    </Box>
  );
};

// Missing icon to add
const SpeedIcon = () => <span role="img" aria-label="speed">⚡</span>;

export default ContractUploaderPage;
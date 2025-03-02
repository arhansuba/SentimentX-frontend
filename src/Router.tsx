import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import DashboardPage from './pages/DashboardPage';
import ContractAnalysisPage from './pages/ContractAnalysisPage';
import AlertsPage from './pages/AlertsPage';
import TransactionsPage from './pages/TransactionsPage';
import ContractUploaderPage from './pages/ContractUploaderPage';
import UploadContractPage from './pages/UploadContractPage';
import ChatAnalysisPage from './pages/ChatAnalysisPage'; // Add the new page

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatAnalysisPage />} /> {/* Make ChatAnalysisPage the default landing page */}
      <Route path="/dashboard" element={<DashboardPage />} /> {/* Move DashboardPage to /dashboard */}
      <Route path="/contracts" element={<ContractAnalysisPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/upload-contract" element={<ContractUploaderPage />} />
      <Route path="/upload-contract-page" element={<UploadContractPage />} /> {/* Add UploadContractPage */}
      <Route path="/chat-analysis" element={<Navigate to="/" replace />} /> {/* Redirect old chat path */}
    </Routes>
  );
};

export default AppRouter;

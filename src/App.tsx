import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SentinelProvider } from './context/SentinelContext';
import { muiTheme as theme } from './utils/themes';

// Import your pages
import DashboardPage from './pages/DashboardPage';
import ContractAnalysisPage from './pages/ContractAnalysisPage';
import AlertsPage from './pages/AlertsPage';
import TransactionsPage from './pages/TransactionsPage';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';

// Styles
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SentinelProvider>
        <Router>
          <div className="app-container">
            <Navbar toggleTheme={function (): void {
              throw new Error('Function not implemented.');
            } } isDarkMode={false} />
            <div className="content-wrapper">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/contracts" element={<ContractAnalysisPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </Router>
      </SentinelProvider>
    </ThemeProvider>
  );
}

export default App;
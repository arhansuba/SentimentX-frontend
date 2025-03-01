import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { SentinelProvider } from './context/SentinelContext';
import { ThemeProvider } from './context/ThemeContext';

// Import components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';

// Import pages
import DashboardPage from './pages/DashboardPage';
import ContractAnalysisPage from './pages/ContractAnalysisPage';
import AlertsPage from './pages/AlertsPage';
import TransactionsPage from './pages/TransactionsPage';
import ContractUploaderPage from './pages/ContractUploaderPage';

// Styles
import './App.css';

function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider>
      <CssBaseline />
      <SentinelProvider>
        <Router>
          <div className="app-container">
            <Navbar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
            <div className="content-wrapper">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/contracts" element={<ContractAnalysisPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/upload-contract" element={<ContractUploaderPage />} />
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
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
// Remove unused imports
// import { CssBaseline } from '@mui/material';
// import { SentinelProvider } from './context/SentinelContext';
// import { ThemeProvider } from './context/ThemeContext';

// Import components
// import Navbar from './components/Layout/Navbar';
// import Footer from './components/Layout/Footer';
// import MainLayout from './components/Layout/MainLayout';
// import AppRouter from './Router'; // Your updated router
import ChatAnalysisPage from './pages/ChatAnalysisPage'; // Import ChatAnalysisPage

// Styles
import './App.css';
import './darkTheme.css'; // Import dark theme CSS

function App() {
  return (
    <Router>
      <ChatAnalysisPage />
    </Router>
  );
}

export default App;
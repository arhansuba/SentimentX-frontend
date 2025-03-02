import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { SentinelProvider } from './context/SentinelContext';
import { ThemeProvider } from './context/ThemeContext';

// Import components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
//import MainLayout from './components/Layout/MainLayout';
import AppRouter from './Router'; // Your updated router

// Styles
import './App.css';
import './darkTheme.css'; // Import dark theme CSS

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
         
            <AppRouter />
          
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
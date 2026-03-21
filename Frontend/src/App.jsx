import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DocumentUpload from './components/DocumentUpload';
import FocusTimer from './pages/FocusTimer';
import Progress from './pages/Progress';
import StudyPlan from './pages/StudyPlan';
import QuizGenerator from './pages/QuizGenerator';
import './GlobalStyles.css'


function App() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('login');
  const [pageParams, setPageParams] = useState({});

  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return currentPage === 'login' ? (
      <Login onNavigate={handleNavigate} />
    ) : (
      <Signup onNavigate={handleNavigate} />
    );
  }

  // User is logged in - show different pages
  switch (currentPage) {
    case 'dashboard':
      return <Dashboard onNavigate={handleNavigate} />;
    case 'documents':
      return <DocumentUpload onNavigate={handleNavigate} />;
    case 'focus':
      return <FocusTimer onNavigate={handleNavigate} />;
    case 'progress':
      return <Progress onNavigate={handleNavigate} />;
    case 'plan':
      return <StudyPlan onNavigate={handleNavigate} />;
    case 'quiz':
      return <QuizGenerator onNavigate={handleNavigate} />;
    default:
      return <Dashboard onNavigate={handleNavigate} />;
  }
}

export default App;
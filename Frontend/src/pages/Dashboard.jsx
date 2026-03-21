import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import luffyImg from '/luffy.png';

export default function Dashboard({ onNavigate }) {
  const { logout } = useAuth();
  const [stats] = useState({
    documents: 8,
    questions: 24,
    quizzes: 5,
    hours: 42
  });

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  const handleQnA = () => onNavigate('documents');
  const handleBeginTraining = () => onNavigate('focus');
  const handleCreatePlan = () => onNavigate('plan');
  const handleGenerateQuiz = () => onNavigate('quiz');
  const handleViewProgress = () => onNavigate('progress');

  return (
    <div className="dashboard-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="logo">🦉</span>
          <h1>AI STUDY COACH</h1>
        </div>
        <div className="navbar-right">
          <button onClick={handleLogout} style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #e8b923, #ffcc33)',
            border: 'none',
            color: '#1a1810',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            transition: 'all 0.3s',
            boxShadow: '0 5px 15px rgba(232, 185, 35, 0.3)'
          }}>
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="container">
        {/* HEADER WITH LUFFY */}
        <div className="header">
          <div className="header-text">
            <h2>Master Your Dreams</h2>
            <p>
              Join the Straw Hat Academy and become the ultimate scholar. Upload your study materials, 
              challenge yourself with AI-generated quizzes, and navigate your path to knowledge mastery 
              with your personal crew of study tools.
            </p>
            <button className="cta-btn" onClick={() => onNavigate('documents')}>🚀 Set Sail Now</button>
          </div>
          <div className="header-image">
            <img 
              src="/luffy.png" 
              alt="Luffy" 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
            />
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="features-grid">
          {/* Q&A Chat */}
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Q&A Chat</h3>
            <p>Upload your documents and ask unlimited questions. Get intelligent, instant answers from AI.</p>
            <button onClick={handleQnA}>Start Learning</button>
          </div>

          {/* Training Timer - SPECIAL CARD */}
          <div className="timer-card">
            <div className="timer-label">⚡ TRAINING SESSION ⚡</div>
            <div className="timer-display">25:00</div>
            <button onClick={handleBeginTraining} className="timer-btn">Begin Training</button>
          </div>

          {/* Study Plan */}
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Treasure Map</h3>
            <p>Get a personalized study roadmap crafted from your learning style and goals.</p>
            <button onClick={handleCreatePlan}>Create Plan</button>
          </div>

          {/* Quiz Generator */}
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Quiz Generator</h3>
            <p>Battle-test yourself with AI-generated quizzes from your documents.</p>
            <button onClick={handleGenerateQuiz}>Generate Quiz</button>
          </div>

          {/* Progress Tracker */}
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracker</h3>
            <p>Track your learning journey and see how far you've come.</p>
            <button onClick={handleViewProgress}>View Progress</button>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-number">{stats.questions}</div>
            <div className="stat-label">Questions Asked</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-number">{stats.quizzes}</div>
            <div className="stat-label">Quizzes Taken</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-number">{stats.hours}</div>
            <div className="stat-label">Hours Studied</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-number">89%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>

        {/* MOTIVATION SECTION */}
        <div className="motivation-section">
          <h3>💡 Remember:</h3>
          <p>"No matter how hard or impossible it seems, never lose sight of your goal."</p>
          <p className="author">— Monkey D. Luffy</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <p>🏴‍☠️ Straw Hat Academy © 2026 | Empowering Scholars Across the Grand Line</p>
        <div className="footer-links">
          <a href="#privacy">⚓ Privacy</a>
          <a href="#terms">⚓ Terms</a>
          <a href="#contact">⚓ Contact</a>
          <a href="#community">⚓ Community</a>
        </div>
      </footer>
    </div>
  );
}
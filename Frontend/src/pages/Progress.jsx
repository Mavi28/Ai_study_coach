import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// ✅ ADD THIS LINE AT THE TOP
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Progress = ({ onNavigate }) => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgressStats();
  }, []);

  const fetchProgressStats = async () => {
    try {
      // ✅ UPDATED: Use API_URL
      const res = await fetch(`${API_URL}/api/progress/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        setError(data.error || 'Failed to fetch progress');
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.owl}>🦉</span>
          <h1 style={styles.brandName}>StudyCoach</h1>
        </div>
        <button onClick={() => onNavigate('dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        <h1 style={styles.pageTitle}>📊 Your Progress</h1>
        <p style={styles.pageSubtitle}>Track your learning journey</p>

        {loading ? (
          <div style={styles.card}>
            <p style={styles.loadingText}>Loading your progress...</p>
          </div>
        ) : error ? (
          <div style={styles.card}>
            <p style={styles.errorText}>{error}</p>
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>💬</div>
                <p style={styles.statNumber}>{stats.questionsAsked || 0}</p>
                <p style={styles.statLabel}>Questions Asked</p>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>📝</div>
                <p style={styles.statNumber}>{stats.quizzesTaken || 0}</p>
                <p style={styles.statLabel}>Quizzes Taken</p>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>⏱️</div>
                <p style={styles.statNumber}>{stats.hoursStudied || 0}</p>
                <p style={styles.statLabel}>Hours Studied</p>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🎯</div>
                <p style={styles.statNumber}>{stats.averageScore || 0}%</p>
                <p style={styles.statLabel}>Avg Score</p>
              </div>
            </div>

            {/* Documents Studied */}
            {stats.documentsStudied && stats.documentsStudied.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>📚 Documents Studied</h2>
                <div style={styles.documentsList}>
                  {stats.documentsStudied.map((doc, idx) => (
                    <div key={idx} style={styles.documentItem}>
                      <p style={styles.docName}>{doc.fileName || doc.name}</p>
                      <p style={styles.docStats}>
                        {doc.questionsAsked || 0} questions • {doc.quizzesGenerated || 0} quizzes
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Quizzes */}
            {stats.recentQuizzes && stats.recentQuizzes.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>📝 Recent Quiz Results</h2>
                <div style={styles.quizzesList}>
                  {stats.recentQuizzes.map((quiz, idx) => (
                    <div key={idx} style={styles.quizItem}>
                      <p style={styles.quizTitle}>{quiz.title || quiz.documentName}</p>
                      <div style={styles.quizScore}>
                        <span style={{
                          ...styles.scoreValue,
                          color: quiz.score >= 80 ? '#4ade80' : quiz.score >= 60 ? '#fbbf24' : '#f87171'
                        }}>
                          {quiz.score}%
                        </span>
                        <span style={styles.quizDate}>
                          {new Date(quiz.date || quiz.takenAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study Streak */}
            {stats.studyStreak !== undefined && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>🔥 Study Streak</h2>
                <p style={styles.streakValue}>{stats.studyStreak} days</p>
                <p style={styles.streakText}>Keep it up! You're on a roll! 🎉</p>
              </div>
            )}
          </>
        ) : (
          <div style={styles.card}>
            <p style={styles.emptyText}>No progress data yet. Start studying to see your stats!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)',
    color: '#fff',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  navbar: {
    background: 'rgba(20, 15, 40, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(201, 169, 97, 0.2)',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  owl: {
    fontSize: '28px',
  },
  brandName: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  backBtn: {
    padding: '10px 20px',
    background: 'rgba(201, 169, 97, 0.2)',
    border: '1px solid rgba(201, 169, 97, 0.4)',
    color: '#c9a961',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '12px',
  },
  content: {
    padding: '40px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  pageTitle: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  pageSubtitle: {
    margin: '0 0 30px 0',
    fontSize: '14px',
    color: '#9ca3af',
  },
  card: {
    background: 'rgba(50, 45, 90, 0.6)',
    border: '1px solid rgba(201, 169, 97, 0.15)',
    borderRadius: '12px',
    padding: '30px',
    backdropFilter: 'blur(8px)',
    marginBottom: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'rgba(50, 45, 90, 0.6)',
    border: '1px solid rgba(201, 169, 97, 0.15)',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    backdropFilter: 'blur(8px)',
  },
  statIcon: {
    fontSize: '32px',
    marginBottom: '15px',
  },
  statNumber: {
    margin: '0 0 5px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  statLabel: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#c9a961',
  },
  loadingText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '13px',
  },
  errorText: {
    textAlign: 'center',
    color: '#f87171',
    fontSize: '13px',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  documentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  documentItem: {
    padding: '15px',
    background: 'rgba(201, 169, 97, 0.05)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
  },
  docName: {
    margin: '0 0 5px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
  },
  docStats: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
  },
  quizzesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  quizItem: {
    padding: '15px',
    background: 'rgba(201, 169, 97, 0.05)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
  },
  quizScore: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  quizDate: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  streakValue: {
    margin: '0 0 10px 0',
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  streakText: {
    margin: 0,
    fontSize: '14px',
    color: '#9ca3af',
  },
};

export default Progress;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
      // ✅ FIXED: Use correct endpoint
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

  const StatCard = ({ icon, number, label, color }) => (
    <div style={{...styles.statCard, borderLeftColor: color}}>
      <div style={{...styles.statIcon, color}}>{icon}</div>
      <div style={styles.statContent}>
        <div style={{...styles.statNumber, color}}>{number}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );

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
        <h1 style={styles.pageTitle}>📊 Your Learning Journey</h1>
        <p style={styles.pageSubtitle}>Track your growth and celebrate your progress</p>

        {loading ? (
          <div style={styles.card}>
            <p style={styles.loadingText}>📈 Loading your progress...</p>
          </div>
        ) : error ? (
          <div style={styles.card}>
            <p style={styles.errorText}>⚠️ {error}</p>
            <button onClick={fetchProgressStats} style={styles.retryBtn}>
              🔄 Retry
            </button>
          </div>
        ) : stats ? (
          <>
            {/* Quick Stats Grid */}
            <div style={styles.statsGrid}>
              <StatCard 
                icon="💬" 
                number={stats.analytics?.totalQuestions || 0} 
                label="Questions Asked" 
                color="#ff9500"
              />
              <StatCard 
                icon="📝" 
                number={stats.analytics?.totalQuizzes || 0} 
                label="Quizzes Taken" 
                color="#667eea"
              />
              <StatCard 
                icon="⏱️" 
                number={stats.analytics?.estimatedHours || 0} 
                label="Hours Studied" 
                color="#4ade80"
              />
              <StatCard 
                icon="🎯" 
                number={`${stats.analytics?.consistencyScore || 0}%`} 
                label="Consistency" 
                color="#ec4899"
              />
            </div>

            {/* Main Insights Card */}
            <div style={styles.card}>
              <div style={styles.insightHeader}>
                <h2 style={styles.insightTitle}>✨ Your Learning Profile</h2>
                <span style={styles.velocityBadge}>
                  {stats.insights?.learningVelocity || 'Steady'}
                </span>
              </div>

              <p style={styles.overview}>
                {stats.insights?.overview || 'Keep up your learning journey! 🚀'}
              </p>

              <div style={styles.insightGrid}>
                <div style={styles.insightBox}>
                  <h3 style={styles.insightLabel}>🔥 Most Active</h3>
                  <p style={styles.insightValue}>
                    {stats.insights?.mostActiveDay || 'Friday'}
                  </p>
                </div>
                <div style={styles.insightBox}>
                  <h3 style={styles.insightLabel}>⚡ Learning Speed</h3>
                  <p style={styles.insightValue}>
                    {stats.insights?.learningVelocity || 'Moderate'}
                  </p>
                </div>
                <div style={styles.insightBox}>
                  <h3 style={styles.insightLabel}>🎓 Avg Session</h3>
                  <p style={styles.insightValue}>
                    {stats.analytics?.avgSessionLength || '45 min'}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            {stats.insights?.keyInsights && stats.insights.keyInsights.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>💡 Key Insights</h2>
                <div style={styles.insightsList}>
                  {stats.insights.keyInsights.map((insight, idx) => (
                    <div key={idx} style={styles.insightItem}>
                      <span style={styles.insightNumber}>{idx + 1}</span>
                      <p style={styles.insightText}>{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Mastery */}
            {stats.analytics?.topicMastery && stats.analytics.topicMastery.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>🎯 Topic Mastery</h2>
                <div style={styles.topicsList}>
                  {stats.analytics.topicMastery.map((topic, idx) => (
                    <div key={idx} style={styles.topicCard}>
                      <div style={styles.topicHeader}>
                        <p style={styles.topicName}>{topic.topic}</p>
                        <span style={{...styles.topicScore, color: topic.mastery >= 75 ? '#4ade80' : topic.mastery >= 50 ? '#fbbf24' : '#f87171'}}>
                          {topic.mastery}%
                        </span>
                      </div>
                      <div style={styles.progressBar}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${topic.mastery}%`,
                            background: topic.mastery >= 75 ? '#4ade80' : topic.mastery >= 50 ? '#fbbf24' : '#f87171',
                          }}
                        />
                      </div>
                      <p style={styles.topicMeta}>
                        {topic.questionsAsked} questions • {topic.avgScore}% avg score
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {stats.analytics?.strengths && stats.analytics.strengths.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>💪 Your Strengths</h2>
                <div style={styles.strengthsList}>
                  {stats.analytics.strengths.map((strength, idx) => (
                    <div key={idx} style={styles.strengthCard}>
                      <p style={styles.strengthTopic}>✅ {strength.topic}</p>
                      <p style={styles.strengthScore}>Mastery: {strength.score}%</p>
                      <p style={styles.strengthFeedback}>{strength.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weaknesses & Recommendations */}
            {stats.analytics?.weaknesses && stats.analytics.weaknesses.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>🚀 Areas to Improve</h2>
                <div style={styles.weaknessList}>
                  {stats.analytics.weaknesses.map((weakness, idx) => (
                    <div key={idx} style={styles.weaknessCard}>
                      <p style={styles.weaknessTopic}>📌 {weakness.topic}</p>
                      <p style={styles.weaknessScore}>Current: {weakness.score}%</p>
                      <p style={styles.weaknessRec}>{weakness.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {stats.insights?.recommendations && stats.insights.recommendations.length > 0 && (
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>🎯 Recommendations</h2>
                <div style={styles.recommendationsList}>
                  {stats.insights.recommendations.map((rec, idx) => (
                    <div key={idx} style={styles.recommendationCard}>
                      <h4 style={styles.recTitle}>{rec.title}</h4>
                      <p style={styles.recDesc}>{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Summary */}
            {stats.insights?.progressSummary && (
              <div style={{...styles.card, background: 'rgba(102, 126, 234, 0.1)', borderLeft: '4px solid #667eea'}}>
                <h2 style={styles.sectionTitle}>📈 Progress Summary</h2>
                <p style={styles.summaryText}>{stats.insights.progressSummary}</p>
              </div>
            )}
          </>
        ) : (
          <div style={styles.card}>
            <p style={styles.emptyText}>📚 No progress data yet. Start studying to see your stats!</p>
            <button onClick={() => onNavigate('documents')} style={styles.actionBtn}>
              🚀 Start Learning
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #2a1810 0%, #3d2817 50%, #1a1810 100%)',
    color: '#fff',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  navbar: {
    background: 'rgba(30, 20, 10, 0.95)',
    backdropFilter: 'blur(15px)',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '3px solid #e8b923',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
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
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pageTitle: {
    margin: '0 0 10px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  pageSubtitle: {
    margin: '0 0 40px 0',
    fontSize: '14px',
    color: '#9ca3af',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: 'rgba(50, 45, 90, 0.6)',
    border: '1px solid rgba(201, 169, 97, 0.15)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    backdropFilter: 'blur(8px)',
    borderLeft: '4px solid',
  },
  statIcon: {
    fontSize: '32px',
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    margin: '0 0 4px 0',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  statLabel: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af',
  },
  card: {
    background: 'rgba(50, 45, 90, 0.6)',
    border: '1px solid rgba(201, 169, 97, 0.15)',
    borderRadius: '12px',
    padding: '30px',
    backdropFilter: 'blur(8px)',
    marginBottom: '30px',
  },
  loadingText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
    margin: 0,
  },
  errorText: {
    textAlign: 'center',
    color: '#f87171',
    fontSize: '14px',
    margin: '0 0 20px 0',
  },
  retryBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'block',
    margin: '0 auto',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px',
    fontStyle: 'italic',
    margin: '0 0 20px 0',
  },
  actionBtn: {
    padding: '12px 24px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'block',
    margin: '0 auto',
  },
  insightHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  insightTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#c9a961',
  },
  velocityBadge: {
    background: 'rgba(201, 169, 97, 0.2)',
    color: '#c9a961',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  overview: {
    fontSize: '14px',
    color: '#d1d5db',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  insightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  insightBox: {
    background: 'rgba(201, 169, 97, 0.05)',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  insightLabel: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '600',
  },
  insightValue: {
    margin: 0,
    fontSize: '16px',
    color: '#c9a961',
    fontWeight: '700',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#c9a961',
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  insightItem: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    background: 'rgba(201, 169, 97, 0.05)',
    borderRadius: '8px',
  },
  insightNumber: {
    background: '#c9a961',
    color: '#0f0f1e',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  insightText: {
    margin: 0,
    fontSize: '14px',
    color: '#d1d5db',
    lineHeight: '1.5',
  },
  topicsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  topicCard: {
    background: 'rgba(30, 25, 60, 0.8)',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid rgba(201, 169, 97, 0.1)',
  },
  topicHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  topicName: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
  },
  topicScore: {
    fontSize: '13px',
    fontWeight: '700',
  },
  progressBar: {
    width: '100%',
    height: '6px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  topicMeta: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
  },
  strengthsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
  },
  strengthCard: {
    background: 'rgba(74, 222, 128, 0.1)',
    border: '1px solid rgba(74, 222, 128, 0.3)',
    padding: '15px',
    borderRadius: '8px',
  },
  strengthTopic: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4ade80',
  },
  strengthScore: {
    margin: '0 0 6px 0',
    fontSize: '12px',
    color: '#9ca3af',
  },
  strengthFeedback: {
    margin: 0,
    fontSize: '12px',
    color: '#d1d5db',
    lineHeight: '1.4',
  },
  weaknessList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
  },
  weaknessCard: {
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.3)',
    padding: '15px',
    borderRadius: '8px',
  },
  weaknessTopic: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#f87171',
  },
  weaknessScore: {
    margin: '0 0 6px 0',
    fontSize: '12px',
    color: '#9ca3af',
  },
  weaknessRec: {
    margin: 0,
    fontSize: '12px',
    color: '#d1d5db',
    lineHeight: '1.4',
  },
  recommendationsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
  },
  recommendationCard: {
    background: 'rgba(201, 169, 97, 0.05)',
    padding: '15px',
    borderRadius: '8px',
    borderLeft: '3px solid #c9a961',
  },
  recTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9a961',
  },
  recDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#d1d5db',
    lineHeight: '1.5',
  },
  summaryText: {
    margin: 0,
    fontSize: '14px',
    color: '#d1d5db',
    lineHeight: '1.6',
  },
};

export default Progress;
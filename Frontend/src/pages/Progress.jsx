import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProgressPageReal = ({ onNavigate }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      console.log('📊 Fetching analytics...');
      
      const res = await fetch('/api/progress/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await res.json();
      setAnalytics(data.analytics);
      setInsights(data.insights);
      console.log('✅ Analytics loaded');
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.navbar}>
          <div style={styles.navLeft}>
            <span style={styles.owl}>🦉</span>
            <h1 style={styles.brandName}>StudyCoach</h1>
          </div>
          <button onClick={() => onNavigate('dashboard')} style={styles.backBtn}>
            ← Back
          </button>
        </div>
        <div style={styles.content}>
          <p style={styles.loadingText}>Loading your progress analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={styles.container}>
        <div style={styles.navbar}>
          <div style={styles.navLeft}>
            <span style={styles.owl}>🦉</span>
            <h1 style={styles.brandName}>StudyCoach</h1>
          </div>
          <button onClick={() => onNavigate('dashboard')} style={styles.backBtn}>
            ← Back
          </button>
        </div>
        <div style={styles.content}>
          <p style={styles.loadingText}>No analytics data yet. Start studying to see your progress!</p>
        </div>
      </div>
    );
  }

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
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>📊 Your Learning Progress</h1>
          <p style={styles.pageSubtitle}>AI-powered analytics of your study journey</p>
        </div>

        {/* Key Metrics */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <p style={styles.metricIcon}>📚</p>
            <p style={styles.metricLabel}>Documents</p>
            <p style={styles.metricValue}>{analytics.totalDocuments}</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricIcon}>❓</p>
            <p style={styles.metricLabel}>Questions Asked</p>
            <p style={styles.metricValue}>{analytics.totalQuestions}</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricIcon}>✅</p>
            <p style={styles.metricLabel}>Quiz Questions</p>
            <p style={styles.metricValue}>{analytics.totalQuizzes}</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricIcon}>⏱️</p>
            <p style={styles.metricLabel}>Study Hours</p>
            <p style={styles.metricValue}>{analytics.estimatedHours}</p>
          </div>
        </div>

        {/* Overview Card */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>🎯 Your Learning Overview</h2>
          <p style={styles.overviewText}>{insights?.overview}</p>
        </div>

        {/* Topic Mastery */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>📈 Topic Mastery</h2>
          {analytics.topicMastery && analytics.topicMastery.length > 0 ? (
            <div style={styles.topicsList}>
              {analytics.topicMastery.map((topic, idx) => (
                <div key={idx} style={styles.topicItem}>
                  <div style={styles.topicHeader}>
                    <p style={styles.topicName}>{topic.topic}</p>
                    <p style={styles.topicPercent}>{topic.mastery}%</p>
                  </div>
                  <div style={styles.masteryBar}>
                    <div
                      style={{
                        ...styles.masteryFill,
                        width: `${topic.mastery}%`,
                        background: topic.mastery >= 80
                          ? '#4ade80'
                          : topic.mastery >= 60
                          ? '#fbbf24'
                          : '#f87171',
                      }}
                    ></div>
                  </div>
                  <p style={styles.topicStats}>
                    {topic.questionsAsked} Q's | Avg: {topic.avgScore}%
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>No topic data yet</p>
          )}
        </div>

        {/* Learning Patterns */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>🔍 Learning Patterns</h2>
          <div style={styles.patternsGrid}>
            <div style={styles.patternCard}>
              <p style={styles.patternLabel}>Most Active Day</p>
              <p style={styles.patternValue}>{insights?.mostActiveDay || 'N/A'}</p>
            </div>
            <div style={styles.patternCard}>
              <p style={styles.patternLabel}>Avg Session Length</p>
              <p style={styles.patternValue}>{analytics.avgSessionLength || 'N/A'}</p>
            </div>
            <div style={styles.patternCard}>
              <p style={styles.patternLabel}>Consistency Score</p>
              <p style={styles.patternValue}>{analytics.consistencyScore}%</p>
            </div>
            <div style={styles.patternCard}>
              <p style={styles.patternLabel}>Learning Velocity</p>
              <p style={styles.patternValue}>{insights?.learningVelocity || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div style={styles.twoColumn}>
          {/* Strengths */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>⭐ Your Strengths</h2>
            {analytics.strengths && analytics.strengths.length > 0 ? (
              <div style={styles.itemsList}>
                {analytics.strengths.map((strength, idx) => (
                  <div key={idx} style={styles.strengthItem}>
                    <p style={styles.itemTitle}>{strength.topic}</p>
                    <p style={styles.itemScore}>Mastery: {strength.score}%</p>
                    <p style={styles.itemText}>{strength.feedback}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.emptyText}>Keep studying to identify strengths!</p>
            )}
          </div>

          {/* Areas for Improvement */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>🎯 Areas to Improve</h2>
            {analytics.weaknesses && analytics.weaknesses.length > 0 ? (
              <div style={styles.itemsList}>
                {analytics.weaknesses.map((weakness, idx) => (
                  <div key={idx} style={styles.weaknessItem}>
                    <p style={styles.itemTitle}>{weakness.topic}</p>
                    <p style={styles.itemScore}>Mastery: {weakness.score}%</p>
                    <p style={styles.itemText}>{weakness.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.emptyText}>Great job! No weak areas detected.</p>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>💡 AI-Generated Insights</h2>
          <div style={styles.insightsList}>
            {insights?.keyInsights && insights.keyInsights.length > 0 ? (
              insights.keyInsights.map((insight, idx) => (
                <div key={idx} style={styles.insightItem}>
                  <p style={styles.insightText}>{insight}</p>
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>More insights coming as you study!</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>🎓 Personalized Recommendations</h2>
          <div style={styles.recommendationsList}>
            {insights?.recommendations && insights.recommendations.length > 0 ? (
              insights.recommendations.map((rec, idx) => (
                <div key={idx} style={styles.recommendationItem}>
                  <span style={styles.recNumber}>{idx + 1}</span>
                  <div>
                    <p style={styles.recTitle}>{rec.title}</p>
                    <p style={styles.recDescription}>{rec.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>Recommendations will appear as you progress!</p>
            )}
          </div>
        </div>

        {/* Progress Summary */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>📈 Progress Summary</h2>
          <p style={styles.summaryText}>{insights?.progressSummary}</p>
          <div style={styles.actionButtons}>
            <button
              onClick={() => onNavigate('quiz')}
              style={styles.actionBtn}
            >
              📝 Take a Quiz
            </button>
            <button
              onClick={() => onNavigate('documents')}
              style={styles.actionBtn}
            >
              💬 Ask Questions
            </button>
            <button
              onClick={() => onNavigate('plan')}
              style={styles.actionBtn}
            >
              🎯 Create Study Plan
            </button>
            <button
              onClick={fetchAnalytics}
              style={styles.refreshBtn}
            >
              🔄 Refresh Analytics
            </button>
          </div>
        </div>
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
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  pageTitle: {
    margin: '0 0 10px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  pageSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#9ca3af',
  },
  loadingText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  metricCard: {
    background: 'rgba(50, 45, 90, 0.6)',
    border: '1px solid rgba(201, 169, 97, 0.15)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  metricIcon: {
    fontSize: '28px',
    margin: '0 0 10px 0',
  },
  metricLabel: {
    margin: '0 0 8px 0',
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  metricValue: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  card: {
    background: 'rgba(50, 45, 90, 0.6)',
    border: '1px solid rgba(201, 169, 97, 0.15)',
    borderRadius: '12px',
    padding: '25px',
    backdropFilter: 'blur(8px)',
    marginBottom: '25px',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#c9a961',
    borderBottom: '1px solid rgba(201, 169, 97, 0.2)',
    paddingBottom: '10px',
  },
  overviewText: {
    margin: 0,
    fontSize: '13px',
    color: '#d1d5db',
    lineHeight: '1.6',
  },
  topicsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  topicItem: {
    padding: '15px',
    background: 'rgba(30, 25, 60, 0.8)',
    borderRadius: '8px',
    border: '1px solid rgba(201, 169, 97, 0.1)',
  },
  topicHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  topicName: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9a961',
  },
  topicPercent: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: '#d1d5db',
  },
  masteryBar: {
    height: '6px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  masteryFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  topicStats: {
    margin: 0,
    fontSize: '10px',
    color: '#9ca3af',
  },
  emptyText: {
    margin: 0,
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  patternsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
  },
  patternCard: {
    background: 'rgba(100, 200, 150, 0.1)',
    border: '1px solid rgba(100, 200, 150, 0.2)',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
  },
  patternLabel: {
    margin: '0 0 8px 0',
    fontSize: '11px',
    color: '#9ca3af',
  },
  patternValue: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#4ade80',
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    marginBottom: '25px',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  strengthItem: {
    background: 'rgba(74, 222, 128, 0.1)',
    border: '1px solid rgba(74, 222, 128, 0.2)',
    borderRadius: '8px',
    padding: '12px',
  },
  weaknessItem: {
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.2)',
    borderRadius: '8px',
    padding: '12px',
  },
  itemTitle: {
    margin: '0 0 6px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9a961',
  },
  itemScore: {
    margin: '0 0 6px 0',
    fontSize: '12px',
    color: '#d1d5db',
  },
  itemText: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  insightItem: {
    background: 'rgba(201, 169, 97, 0.1)',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    borderRadius: '8px',
    padding: '12px',
  },
  insightText: {
    margin: 0,
    fontSize: '12px',
    color: '#d1d5db',
    lineHeight: '1.5',
  },
  recommendationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recommendationItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    background: 'rgba(100, 200, 150, 0.1)',
    border: '1px solid rgba(100, 200, 150, 0.2)',
    borderRadius: '8px',
  },
  recNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#4ade80',
    color: '#0f0f1e',
    fontWeight: '600',
    fontSize: '12px',
    flexShrink: 0,
  },
  recTitle: {
    margin: '0 0 4px 0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#4ade80',
  },
  recDescription: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
  },
  summaryText: {
    margin: '0 0 20px 0',
    fontSize: '13px',
    color: '#d1d5db',
    lineHeight: '1.6',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
  },
  actionBtn: {
    padding: '10px 15px',
    background: 'rgba(201, 169, 97, 0.2)',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    color: '#c9a961',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
  },
  refreshBtn: {
    padding: '10px 15px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
  },
};

export default ProgressPageReal;
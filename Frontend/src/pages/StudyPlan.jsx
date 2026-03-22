import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudyPlan = ({ onNavigate }) => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [learningStyle, setLearningStyle] = useState('visual');
  const [timeframe, setTimeframe] = useState('1week');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents.filter(d => d.processingStatus === 'completed'));
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateStudyPlan = async () => {
    if (!selectedDoc) {
      alert('Please select a document');
      return;
    }

    setGeneratingPlan(true);

    try {
      const res = await fetch(`${API_URL}/api/study-plan/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAnswers: {
            learningStyle: learningStyle,
            studyGoal: 'Master the material comprehensively',
            timeAvailable: timeframe === '1week' ? '4 hours/day' : timeframe === '2weeks' ? '2 hours/day' : '1 hour/day',
            pacePreference: timeframe === '1week' ? 'Intensive' : timeframe === '2weeks' ? 'Moderate' : 'Relaxed',
            strengths: 'Eager and motivated to learn',
          },
          selectedDocuments: [selectedDoc],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate study plan');
      }

      setStudyPlan(data.plan);
    } catch (err) {
      console.error('Error generating plan:', err);
      alert('Error: ' + err.message);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const LearningStyleOption = ({ value, icon, label, desc }) => (
    <div
      onClick={() => setLearningStyle(value)}
      style={{
        ...styles.styleOption,
        background: learningStyle === value ? 'rgba(201, 169, 97, 0.3)' : 'rgba(201, 169, 97, 0.05)',
        borderColor: learningStyle === value ? '#c9a961' : 'rgba(201, 169, 97, 0.1)',
        transform: learningStyle === value ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <div style={styles.styleIcon}>{icon}</div>
      <h4 style={styles.styleLabel}>{label}</h4>
      <p style={styles.styleDesc}>{desc}</p>
    </div>
  );

  const TimeframeOption = ({ value, icon, label, desc }) => (
    <div
      onClick={() => setTimeframe(value)}
      style={{
        ...styles.timeOption,
        background: timeframe === value ? 'rgba(201, 169, 97, 0.3)' : 'rgba(201, 169, 97, 0.05)',
        borderColor: timeframe === value ? '#c9a961' : 'rgba(201, 169, 97, 0.1)',
        transform: timeframe === value ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <div style={styles.timeIcon}>{icon}</div>
      <h4 style={styles.timeLabel}>{label}</h4>
      <p style={styles.timeDesc}>{desc}</p>
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
        <h1 style={styles.pageTitle}>🗺️ Your Personalized Study Plan</h1>
        <p style={styles.pageSubtitle}>AI-powered learning roadmap tailored to your style</p>

        {!studyPlan ? (
          <>
            {/* Document Selection */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>📚 Step 1: Choose Your Study Material</h2>

              {loading ? (
                <p style={styles.loadingText}>Loading your documents...</p>
              ) : documents.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyText}>No documents to study yet</p>
                  <button 
                    onClick={() => onNavigate('documents')} 
                    style={styles.uploadBtn}
                  >
                    📤 Upload a Document
                  </button>
                </div>
              ) : (
                <div style={styles.documentGrid}>
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDoc(doc._id)}
                      style={{
                        ...styles.docCard,
                        background: selectedDoc === doc._id
                          ? 'linear-gradient(135deg, rgba(201, 169, 97, 0.3) 0%, rgba(201, 169, 97, 0.1) 100%)'
                          : 'rgba(30, 25, 60, 0.8)',
                        borderColor: selectedDoc === doc._id ? '#c9a961' : 'rgba(201, 169, 97, 0.2)',
                        boxShadow: selectedDoc === doc._id ? '0 0 20px rgba(201, 169, 97, 0.3)' : 'none',
                      }}
                    >
                      <div style={styles.docIcon}>📄</div>
                      <p style={styles.docTitle}>{doc.fileName}</p>
                      <p style={styles.docInfo}>{doc.totalPages} pages • {doc.totalChunks} chunks</p>
                      {selectedDoc === doc._id && <div style={styles.checkmark}>✓</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Learning Style Selection */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>👁️ Step 2: Pick Your Learning Style</h2>
              <p style={styles.stepDesc}>Choose how you learn best</p>
              <div style={styles.styleGrid}>
                <LearningStyleOption 
                  value="visual" 
                  icon="👁️" 
                  label="Visual" 
                  desc="Diagrams, charts, mind maps"
                />
                <LearningStyleOption 
                  value="auditory" 
                  icon="🎵" 
                  label="Auditory" 
                  desc="Discussions, explanations"
                />
                <LearningStyleOption 
                  value="kinesthetic" 
                  icon="✋" 
                  label="Kinesthetic" 
                  desc="Hands-on, practice problems"
                />
              </div>
            </div>

            {/* Timeframe Selection */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>⏰ Step 3: Select Your Timeframe</h2>
              <p style={styles.stepDesc}>How much time do you have?</p>
              <div style={styles.timeGrid}>
                <TimeframeOption 
                  value="1week" 
                  icon="⚡" 
                  label="1 Week" 
                  desc="4 hours/day - Intensive"
                />
                <TimeframeOption 
                  value="2weeks" 
                  icon="📅" 
                  label="2 Weeks" 
                  desc="2 hours/day - Moderate"
                />
                <TimeframeOption 
                  value="1month" 
                  icon="🎯" 
                  label="1 Month" 
                  desc="1 hour/day - Relaxed"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div style={styles.actionCard}>
              <button
                onClick={generateStudyPlan}
                disabled={!selectedDoc || generatingPlan}
                style={{
                  ...styles.generateBtn,
                  opacity: !selectedDoc || generatingPlan ? 0.6 : 1,
                  cursor: !selectedDoc || generatingPlan ? 'not-allowed' : 'pointer',
                }}
              >
                {generatingPlan ? (
                  <>⏳ Generating Your Plan...</>
                ) : (
                  <>🚀 Generate My Study Plan</>
                )}
              </button>
              <p style={styles.generateHint}>
                Our AI will create a personalized study roadmap just for you
              </p>
            </div>
          </>
        ) : (
          /* Study Plan Display */
          <>
            <div style={styles.planCard}>
              <div style={styles.planHeader}>
                <h2 style={styles.planTitle}>🎓 Your Study Plan</h2>
                <button onClick={() => setStudyPlan(null)} style={styles.editBtn}>
                  ✏️ Regenerate
                </button>
              </div>

              <div style={styles.planMeta}>
                <span style={styles.metaItem}>📚 {learningStyle.toUpperCase()}</span>
                <span style={styles.metaItem}>⏰ {timeframe === '1week' ? '1 Week' : timeframe === '2weeks' ? '2 Weeks' : '1 Month'}</span>
              </div>

              {/* Overview */}
              {studyPlan.overview && (
                <div style={styles.overviewBox}>
                  <h3 style={styles.overviewTitle}>📝 Plan Overview</h3>
                  <p style={styles.overviewText}>{studyPlan.overview}</p>
                </div>
              )}

              {/* Recommended Method */}
              {studyPlan.recommendedMethod && (
                <div style={styles.methodBox}>
                  <h3 style={styles.methodTitle}>🎯 Recommended Study Method</h3>
                  <p style={styles.methodText}>{studyPlan.recommendedMethod}</p>
                </div>
              )}

              {/* Weekly Schedule */}
              {studyPlan.weeklySchedule && studyPlan.weeklySchedule.length > 0 && (
                <div style={styles.scheduleSection}>
                  <h3 style={styles.sectionTitle}>📅 Weekly Schedule</h3>
                  <div style={styles.scheduleContainer}>
                    {studyPlan.weeklySchedule.map((day, idx) => (
                      <div key={idx} style={styles.dayBox}>
                        <h4 style={styles.dayName}>{day.day}</h4>
                        <p style={styles.dayFocus}>📌 {day.focus}</p>
                        <p style={styles.dayTime}>⏱️ {day.duration}</p>
                        <p style={styles.dayTechnique}>🔧 {day.technique}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Routine */}
              {studyPlan.dailyRoutine && studyPlan.dailyRoutine.length > 0 && (
                <div style={styles.routineSection}>
                  <h3 style={styles.sectionTitle}>⏰ Daily Routine</h3>
                  <div style={styles.routineList}>
                    {studyPlan.dailyRoutine.map((item, idx) => (
                      <div key={idx} style={styles.routineItem}>
                        <span style={styles.routineTime}>{item.time}</span>
                        <span style={styles.routineActivity}>{item.activity}</span>
                        <span style={styles.routineTip}>💡 {item.tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Techniques */}
              {studyPlan.studyTechniques && studyPlan.studyTechniques.length > 0 && (
                <div style={styles.techniquesSection}>
                  <h3 style={styles.sectionTitle}>🎯 Study Techniques</h3>
                  <div style={styles.techniquesGrid}>
                    {studyPlan.studyTechniques.map((technique, idx) => (
                      <div key={idx} style={styles.techniqueBox}>
                        <h4 style={styles.techniqueName}>{technique.name}</h4>
                        <p style={styles.techniqueDesc}>{technique.description}</p>
                        <p style={styles.techniqueWhen}>⭐ {technique.whenToUse}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones */}
              {studyPlan.milestones && studyPlan.milestones.length > 0 && (
                <div style={styles.milestonesSection}>
                  <h3 style={styles.sectionTitle}>🏆 Milestones</h3>
                  <div style={styles.milestonesList}>
                    {studyPlan.milestones.map((milestone, idx) => (
                      <div key={idx} style={styles.milestoneItem}>
                        <span style={styles.milestoneWeek}>{milestone.week}</span>
                        <span style={styles.milestoneGoal}>{milestone.goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips for Success */}
              {studyPlan.tipsForSuccess && studyPlan.tipsForSuccess.length > 0 && (
                <div style={styles.tipsSection}>
                  <h3 style={styles.sectionTitle}>✨ Tips for Success</h3>
                  <ul style={styles.tipsList}>
                    {studyPlan.tipsForSuccess.map((tip, idx) => (
                      <li key={idx} style={styles.tipItem}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button
                onClick={() => setStudyPlan(null)}
                style={styles.secondaryBtn}
              >
                ✏️ Regenerate Plan
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                style={styles.primaryBtn}
              >
                🏠 Back to Dashboard
              </button>
            </div>
          </>
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
    background: 'linear-gradient(135deg, #c9a961, #ffcc33)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  pageSubtitle: {
    margin: '0 0 40px 0',
    fontSize: '14px',
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
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#c9a961',
  },
  stepDesc: {
    margin: '0 0 20px 0',
    fontSize: '13px',
    color: '#9ca3af',
  },
  loadingText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px',
  },
  uploadBtn: {
    padding: '12px 24px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  documentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  docCard: {
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textAlign: 'center',
    position: 'relative',
  },
  docIcon: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  docTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
  },
  docInfo: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
  },
  checkmark: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#4ade80',
    color: '#fff',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  styleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  styleOption: {
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.3s',
  },
  styleIcon: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  styleLabel: {
    margin: '0 0 6px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9a961',
  },
  styleDesc: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
  },
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  timeOption: {
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.3s',
  },
  timeIcon: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  timeLabel: {
    margin: '0 0 6px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9a961',
  },
  timeDesc: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
  },
  actionCard: {
    background: 'rgba(102, 126, 234, 0.1)',
    border: '2px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
  },
  generateBtn: {
    padding: '14px 40px',
    background: 'linear-gradient(135deg, #c9a961, #ffcc33)',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '16px',
    marginBottom: '15px',
  },
  generateHint: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af',
  },
  planCard: {
    background: 'rgba(50, 45, 90, 0.6)',
    border: '1px solid rgba(201, 169, 97, 0.15)',
    borderRadius: '12px',
    padding: '40px',
    backdropFilter: 'blur(8px)',
    marginBottom: '30px',
  },
  planHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  planTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#c9a961',
  },
  editBtn: {
    padding: '10px 20px',
    background: 'rgba(201, 169, 97, 0.2)',
    border: '1px solid rgba(201, 169, 97, 0.4)',
    color: '#c9a961',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  planMeta: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  metaItem: {
    background: 'rgba(201, 169, 97, 0.1)',
    color: '#c9a961',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  overviewBox: {
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  overviewTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#667eea',
  },
  overviewText: {
    margin: 0,
    fontSize: '13px',
    color: '#d1d5db',
    lineHeight: '1.6',
  },
  methodBox: {
    background: 'rgba(74, 222, 128, 0.1)',
    border: '1px solid rgba(74, 222, 128, 0.3)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  methodTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4ade80',
  },
  methodText: {
    margin: 0,
    fontSize: '13px',
    color: '#d1d5db',
    lineHeight: '1.6',
  },
  scheduleSection: {
    marginBottom: '30px',
  },
  scheduleContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  dayBox: {
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    padding: '15px',
  },
  dayName: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: '700',
    color: '#c9a961',
  },
  dayFocus: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#d1d5db',
  },
  dayTime: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#9ca3af',
  },
  dayTechnique: {
    margin: 0,
    fontSize: '12px',
    color: '#d1d5db',
  },
  routineSection: {
    marginBottom: '30px',
  },
  routineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  routineItem: {
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    padding: '12px',
    display: 'grid',
    gridTemplateColumns: '80px 1fr auto',
    gap: '15px',
    alignItems: 'center',
  },
  routineTime: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#c9a961',
  },
  routineActivity: {
    fontSize: '12px',
    color: '#d1d5db',
  },
  routineTip: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  techniquesSection: {
    marginBottom: '30px',
  },
  techniquesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  techniqueBox: {
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    padding: '15px',
  },
  techniqueName: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9a961',
  },
  techniqueDesc: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#d1d5db',
  },
  techniqueWhen: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
  },
  milestonesSection: {
    marginBottom: '30px',
  },
  milestonesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  milestoneItem: {
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    padding: '12px 15px',
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  milestoneWeek: {
    background: '#c9a961',
    color: '#0f0f1e',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    minWidth: '60px',
    textAlign: 'center',
  },
  milestoneGoal: {
    fontSize: '12px',
    color: '#d1d5db',
    flex: 1,
  },
  tipsSection: {
    marginBottom: '30px',
  },
  tipsList: {
    margin: 0,
    paddingLeft: '20px',
  },
  tipItem: {
    marginBottom: '10px',
    fontSize: '12px',
    color: '#d1d5db',
    lineHeight: '1.5',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  primaryBtn: {
    padding: '12px 24px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  secondaryBtn: {
    padding: '12px 24px',
    background: 'rgba(201, 169, 97, 0.2)',
    color: '#c9a961',
    border: '1px solid rgba(201, 169, 97, 0.4)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
};

export default StudyPlan;
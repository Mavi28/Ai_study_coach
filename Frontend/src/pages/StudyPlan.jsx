import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// ✅ ADD THIS LINE
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudyPlan = ({ onNavigate }) => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [learningStyle, setLearningStyle] = useState('visual'); // visual, auditory, kinesthetic
  const [timeframe, setTimeframe] = useState('1week'); // 1week, 2weeks, 1month

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      // ✅ UPDATED: Use API_URL
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
      // ✅ UPDATED: Use API_URL and correct payload
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
        <h1 style={styles.pageTitle}>🗺️ Personalized Study Plan</h1>
        <p style={styles.pageSubtitle}>Get a customized learning roadmap</p>

        {!studyPlan ? (
          // Plan Generator
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>📚 Select Document & Preferences</h2>

            {loading ? (
              <p style={styles.loadingText}>Loading documents...</p>
            ) : documents.length === 0 ? (
              <p style={styles.emptyText}>No documents available. Upload one first!</p>
            ) : (
              <>
                {/* Document Selection */}
                <div style={styles.documentList}>
                  <h3 style={styles.subtitle}>Choose a Document</h3>
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDoc(doc._id)}
                      style={{
                        ...styles.docItem,
                        background: selectedDoc === doc._id
                          ? 'rgba(201, 169, 97, 0.2)'
                          : 'rgba(201, 169, 97, 0.05)',
                        borderColor: selectedDoc === doc._id
                          ? '#c9a961'
                          : 'rgba(201, 169, 97, 0.1)',
                      }}
                    >
                      <p style={styles.docName}>{doc.fileName}</p>
                      <p style={styles.docMeta}>{doc.totalPages} pages • {doc.totalChunks} chunks</p>
                    </div>
                  ))}
                </div>

                {/* Learning Style */}
                <div style={styles.optionsSection}>
                  <h3 style={styles.subtitle}>Learning Style</h3>
                  <div style={styles.optionsGrid}>
                    {[
                      { value: 'visual', label: '👁️ Visual', desc: 'Images, diagrams, charts' },
                      { value: 'auditory', label: '🎵 Auditory', desc: 'Discussions, summaries' },
                      { value: 'kinesthetic', label: '✋ Kinesthetic', desc: 'Hands-on activities' },
                    ].map((style) => (
                      <div
                        key={style.value}
                        onClick={() => setLearningStyle(style.value)}
                        style={{
                          ...styles.optionBox,
                          background: learningStyle === style.value
                            ? 'rgba(201, 169, 97, 0.3)'
                            : 'rgba(201, 169, 97, 0.05)',
                          borderColor: learningStyle === style.value
                            ? '#c9a961'
                            : 'rgba(201, 169, 97, 0.1)',
                        }}
                      >
                        <p style={styles.optionLabel}>{style.label}</p>
                        <p style={styles.optionDesc}>{style.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeframe */}
                <div style={styles.optionsSection}>
                  <h3 style={styles.subtitle}>Study Timeframe</h3>
                  <div style={styles.optionsGrid}>
                    {[
                      { value: '1week', label: '⚡ 1 Week', desc: 'Intensive' },
                      { value: '2weeks', label: '📅 2 Weeks', desc: 'Moderate' },
                      { value: '1month', label: '🎯 1 Month', desc: 'Relaxed' },
                    ].map((frame) => (
                      <div
                        key={frame.value}
                        onClick={() => setTimeframe(frame.value)}
                        style={{
                          ...styles.optionBox,
                          background: timeframe === frame.value
                            ? 'rgba(201, 169, 97, 0.3)'
                            : 'rgba(201, 169, 97, 0.05)',
                          borderColor: timeframe === frame.value
                            ? '#c9a961'
                            : 'rgba(201, 169, 97, 0.1)',
                        }}
                      >
                        <p style={styles.optionLabel}>{frame.label}</p>
                        <p style={styles.optionDesc}>{frame.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateStudyPlan}
                  disabled={!selectedDoc || generatingPlan}
                  style={{
                    ...styles.generateBtn,
                    opacity: !selectedDoc || generatingPlan ? 0.6 : 1,
                  }}
                >
                  {generatingPlan ? '🤖 Generating Plan...' : '🚀 Generate Study Plan'}
                </button>
              </>
            )}
          </div>
        ) : (
          // Study Plan Display
          <div style={styles.card}>
            <div style={styles.planHeader}>
              <h2 style={styles.planTitle}>{studyPlan.overview || 'Your Study Plan'}</h2>
              <button
                onClick={() => setStudyPlan(null)}
                style={styles.editBtn}
              >
                ✏️ Edit Plan
              </button>
            </div>

            <div style={styles.planInfo}>
              <p><strong>Learning Style:</strong> {learningStyle}</p>
              <p><strong>Timeframe:</strong> {timeframe}</p>
              <p><strong>Study Method:</strong> {studyPlan.recommendedMethod || 'Personalized approach'}</p>
            </div>

            {/* Weekly Schedule */}
            {studyPlan.weeklySchedule && studyPlan.weeklySchedule.length > 0 && (
              <div style={styles.scheduleSection}>
                <h3 style={styles.subtitle}>📅 Weekly Schedule</h3>
                {studyPlan.weeklySchedule.map((day, idx) => (
                  <div key={idx} style={styles.scheduleItem}>
                    <h4 style={styles.dayTitle}>{day.day}</h4>
                    <p><strong>Focus:</strong> {day.focus}</p>
                    <p><strong>Duration:</strong> {day.duration}</p>
                    <p><strong>Technique:</strong> {day.technique}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Daily Routine */}
            {studyPlan.dailyRoutine && studyPlan.dailyRoutine.length > 0 && (
              <div style={styles.routineSection}>
                <h3 style={styles.subtitle}>⏰ Daily Routine</h3>
                {studyPlan.dailyRoutine.map((item, idx) => (
                  <div key={idx} style={styles.routineItem}>
                    <p><strong>{item.time}</strong> - {item.activity}</p>
                    <p style={styles.routineTip}>💡 {item.tip}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Study Techniques */}
            {studyPlan.studyTechniques && studyPlan.studyTechniques.length > 0 && (
              <div style={styles.techniquesSection}>
                <h3 style={styles.subtitle}>🎯 Study Techniques</h3>
                {studyPlan.studyTechniques.map((technique, idx) => (
                  <div key={idx} style={styles.techniqueItem}>
                    <h4>{technique.name}</h4>
                    <p>{technique.description}</p>
                    <p style={styles.whenToUse}><strong>When to use:</strong> {technique.whenToUse}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Milestones */}
            {studyPlan.milestones && studyPlan.milestones.length > 0 && (
              <div style={styles.milestonesSection}>
                <h3 style={styles.subtitle}>🏆 Milestones</h3>
                {studyPlan.milestones.map((milestone, idx) => (
                  <div key={idx} style={styles.milestoneItem}>
                    <p><strong>{milestone.week}:</strong> {milestone.goal}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tips for Success */}
            {studyPlan.tipsForSuccess && studyPlan.tipsForSuccess.length > 0 && (
              <div style={styles.tipsSection}>
                <h3 style={styles.subtitle}>✨ Tips for Success</h3>
                <ul style={styles.tipsList}>
                  {studyPlan.tipsForSuccess.map((tip, idx) => (
                    <li key={idx} style={styles.tipItem}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => onNavigate('dashboard')}
              style={styles.backBtnStyle}
            >
              🏠 Back to Dashboard
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
    maxWidth: '900px',
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
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  documentList: {
    marginBottom: '30px',
  },
  subtitle: {
    margin: '0 0 15px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9a961',
  },
  docItem: {
    padding: '15px',
    background: 'rgba(201, 169, 97, 0.05)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginBottom: '10px',
  },
  docName: {
    margin: '0 0 5px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
  },
  docMeta: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
  },
  optionsSection: {
    marginBottom: '30px',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  optionBox: {
    padding: '15px',
    background: 'rgba(201, 169, 97, 0.05)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textAlign: 'center',
  },
  optionLabel: {
    margin: '0 0 5px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9a961',
  },
  optionDesc: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
  },
  generateBtn: {
    padding: '12px 24px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    width: '100%',
  },
  planHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  planTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#c9a961',
  },
  editBtn: {
    padding: '8px 16px',
    background: 'rgba(201, 169, 97, 0.2)',
    border: '1px solid rgba(201, 169, 97, 0.4)',
    color: '#c9a961',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
  },
  planInfo: {
    background: 'rgba(201, 169, 97, 0.05)',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#d1d5db',
  },
  scheduleSection: {
    marginBottom: '30px',
  },
  scheduleItem: {
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
  },
  dayTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9a961',
  },
  routineSection: {
    marginBottom: '30px',
  },
  routineItem: {
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px',
    fontSize: '12px',
    color: '#d1d5db',
  },
  routineTip: {
    margin: '6px 0 0 0',
    fontSize: '11px',
    color: '#c9a961',
  },
  techniquesSection: {
    marginBottom: '30px',
  },
  techniqueItem: {
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '12px',
  },
  whenToUse: {
    margin: '8px 0 0 0',
    fontSize: '11px',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  milestonesSection: {
    marginBottom: '30px',
  },
  milestoneItem: {
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px',
    fontSize: '12px',
    color: '#d1d5db',
  },
  tipsSection: {
    marginBottom: '30px',
  },
  tipsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '12px',
    color: '#9ca3af',
  },
  tipItem: {
    marginBottom: '8px',
  },
  backBtnStyle: {
    padding: '12px 20px',
    background: 'rgba(201, 169, 97, 0.2)',
    border: '1px solid rgba(201, 169, 97, 0.4)',
    color: '#c9a961',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    width: '100%',
  },
};

export default StudyPlan;
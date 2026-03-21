import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SmartStudyPlan = ({ onNavigate }) => {
  const { token } = useAuth();
  const [step, setStep] = useState('intro'); // intro, questions, plan, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);

  const intelligentQuestions = [
    {
      id: 'learningStyle',
      question: 'What\'s your preferred learning style?',
      type: 'multiple',
      options: [
        'Visual (diagrams, videos, charts)',
        'Auditory (lectures, discussions, explanations)',
        'Reading/Writing (notes, textbooks, articles)',
        'Kinesthetic (hands-on, practice, experiments)',
      ],
    },
    {
      id: 'studyGoal',
      question: 'What\'s your primary study goal?',
      type: 'multiple',
      options: [
        'Pass an exam',
        'Master the subject deeply',
        'Complete a course',
        'Learn specific skills',
        'Prepare for a career',
      ],
    },
    {
      id: 'timeAvailable',
      question: 'How much time can you dedicate daily?',
      type: 'multiple',
      options: [
        'Less than 30 minutes',
        '30-60 minutes',
        '1-2 hours',
        '2-3 hours',
        'More than 3 hours',
      ],
    },
    {
      id: 'pacePreference',
      question: 'How do you prefer to pace your learning?',
      type: 'multiple',
      options: [
        'Intensive (focus on one topic deeply)',
        'Spread out (cover multiple topics)',
        'Balanced (mix of depth and breadth)',
        'Flexible (adapt as I go)',
      ],
    },
    {
      id: 'strengths',
      question: 'What are your current knowledge strengths?',
      type: 'multiple',
      options: [
        'Strong fundamentals, need advanced topics',
        'Advanced knowledge, need to refresh basics',
        'Gaps in specific areas',
        'Starting from scratch',
        'Well-rounded but want to improve',
      ],
    },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents.filter(d => d.processingStatus === 'completed'));
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleAnswerSelect = (answer) => {
    setAnswers({
      ...answers,
      [intelligentQuestions[currentQuestion].id]: answer,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < intelligentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      generateSmartPlan();
    }
  };

  const generateSmartPlan = async () => {
    if (selectedDocs.length === 0) {
      alert('Please select at least one document');
      return;
    }

    setLoading(true);

    try {
      console.log('🤖 Generating smart study plan with Groq...');

      const response = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAnswers: answers,
          selectedDocuments: selectedDocs,
          documentCount: selectedDocs.length,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setStudyPlan(data.plan);
      setStep('results');
    } catch (err) {
      console.error('Error generating plan:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDocumentSelect = (docId) => {
    if (selectedDocs.includes(docId)) {
      setSelectedDocs(selectedDocs.filter(id => id !== docId));
    } else {
      setSelectedDocs([...selectedDocs, docId]);
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
        {step === 'intro' && (
          <div style={styles.card}>
            <h1 style={styles.title}>🎯 Smart Study Plan</h1>
            <p style={styles.subtitle}>Let's create a personalized study plan based on your preferences and goals</p>

            <div style={styles.introContent}>
              <p style={styles.introText}>
                Answer a few intelligent questions about your learning style, goals, and available time. 
                We'll analyze your responses and create a customized study plan that works for YOU.
              </p>

              <div style={styles.features}>
                <div style={styles.feature}>
                  <p style={styles.featureIcon}>🧠</p>
                  <p style={styles.featureText}>Personalized to your learning style</p>
                </div>
                <div style={styles.feature}>
                  <p style={styles.featureIcon}>⏱️</p>
                  <p style={styles.featureText}>Realistic time management</p>
                </div>
                <div style={styles.feature}>
                  <p style={styles.featureIcon}>📚</p>
                  <p style={styles.featureText}>Based on proven study methods</p>
                </div>
                <div style={styles.feature}>
                  <p style={styles.featureIcon}>🎯</p>
                  <p style={styles.featureText}>Aligned with your goals</p>
                </div>
              </div>

              <button
                onClick={() => setStep('questions')}
                style={styles.startBtn}
              >
                🚀 Start Creating My Plan
              </button>
            </div>
          </div>
        )}

        {step === 'questions' && (
          <div style={styles.card}>
            <div style={styles.progressContainer}>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${((currentQuestion + 1) / intelligentQuestions.length) * 100}%`,
                  }}
                ></div>
              </div>
              <p style={styles.progressText}>
                Question {currentQuestion + 1} of {intelligentQuestions.length}
              </p>
            </div>

            <h2 style={styles.questionTitle}>
              {intelligentQuestions[currentQuestion].question}
            </h2>

            <div style={styles.optionsContainer}>
              {intelligentQuestions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(option)}
                  style={{
                    ...styles.optionBtn,
                    background: answers[intelligentQuestions[currentQuestion].id] === option
                      ? '#c9a961'
                      : 'rgba(201, 169, 97, 0.1)',
                    color: answers[intelligentQuestions[currentQuestion].id] === option
                      ? '#0f0f1e'
                      : '#d1d5db',
                    borderColor: answers[intelligentQuestions[currentQuestion].id] === option
                      ? '#c9a961'
                      : 'rgba(201, 169, 97, 0.2)',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            {currentQuestion === intelligentQuestions.length - 1 && (
              <div style={styles.documentSelection}>
                <h3 style={styles.docTitle}>📚 Select Documents to Study</h3>
                <p style={styles.docSubtitle}>Choose the documents you want to focus on</p>
                
                {documents.length === 0 ? (
                  <p style={styles.noDocText}>No documents available. Upload some first!</p>
                ) : (
                  <div style={styles.docsList}>
                    {documents.map((doc) => (
                      <label key={doc._id} style={styles.docCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedDocs.includes(doc._id)}
                          onChange={() => toggleDocumentSelect(doc._id)}
                          style={styles.checkboxInput}
                        />
                        <span style={styles.checkboxLabel}>{doc.fileName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={styles.buttonContainer}>
              {currentQuestion > 0 && (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  style={styles.backButton}
                >
                  ← Previous
                </button>
              )}
              <button
                onClick={handleNextQuestion}
                disabled={!answers[intelligentQuestions[currentQuestion].id] || (currentQuestion === intelligentQuestions.length - 1 && selectedDocs.length === 0) || loading}
                style={{
                  ...styles.nextButton,
                  opacity: !answers[intelligentQuestions[currentQuestion].id] || (currentQuestion === intelligentQuestions.length - 1 && selectedDocs.length === 0) || loading ? 0.6 : 1,
                }}
              >
                {loading ? '🤖 Generating Plan...' : currentQuestion === intelligentQuestions.length - 1 ? '✨ Generate My Plan' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {step === 'results' && studyPlan && (
          <div style={styles.card}>
            <div style={styles.resultsHeader}>
              <h1 style={styles.resultsTitle}>✨ Your Personalized Study Plan</h1>
              <p style={styles.resultsSubtitle}>Based on your learning preferences and goals</p>
            </div>

            {/* Overview */}
            <div style={styles.overviewSection}>
              <h2 style={styles.sectionTitle}>📋 Plan Overview</h2>
              <p style={styles.overviewText}>{studyPlan.overview}</p>
            </div>

            {/* Study Method */}
            <div style={styles.methodSection}>
              <h2 style={styles.sectionTitle}>🧠 Recommended Study Method</h2>
              <p style={styles.methodText}>{studyPlan.recommendedMethod}</p>
            </div>

            {/* Weekly Schedule */}
            <div style={styles.scheduleSection}>
              <h2 style={styles.sectionTitle}>📅 Weekly Schedule</h2>
              <div style={styles.weekGrid}>
                {studyPlan.weeklySchedule.map((day, idx) => (
                  <div key={idx} style={styles.dayCard}>
                    <p style={styles.dayName}>{day.day}</p>
                    <p style={styles.dayTopic}>{day.focus}</p>
                    <p style={styles.dayDuration}>{day.duration}</p>
                    <p style={styles.dayTechnique}>{day.technique}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Routine */}
            <div style={styles.routineSection}>
              <h2 style={styles.sectionTitle}>⏰ Suggested Daily Routine</h2>
              {studyPlan.dailyRoutine.map((activity, idx) => (
                <div key={idx} style={styles.routineItem}>
                  <span style={styles.routineTime}>{activity.time}</span>
                  <span style={styles.routineActivity}>{activity.activity}</span>
                  <span style={styles.routineTip}>{activity.tip}</span>
                </div>
              ))}
            </div>

            {/* Study Techniques */}
            <div style={styles.techniquesSection}>
              <h2 style={styles.sectionTitle}>🎯 Study Techniques for Your Style</h2>
              {studyPlan.studyTechniques.map((technique, idx) => (
                <div key={idx} style={styles.techniqueCard}>
                  <p style={styles.techniqueName}>{technique.name}</p>
                  <p style={styles.techniqueDescription}>{technique.description}</p>
                  <p style={styles.techniqueWhen}>When to use: {technique.whenToUse}</p>
                </div>
              ))}
            </div>

            {/* Goals & Milestones */}
            <div style={styles.goalsSection}>
              <h2 style={styles.sectionTitle}>🎯 Goals & Milestones</h2>
              {studyPlan.milestones.map((milestone, idx) => (
                <div key={idx} style={styles.milestoneItem}>
                  <span style={styles.milestoneWeek}>{milestone.week}</span>
                  <span style={styles.milestoneGoal}>{milestone.goal}</span>
                </div>
              ))}
            </div>

            {/* Tips for Success */}
            <div style={styles.tipsSection}>
              <h2 style={styles.sectionTitle}>💡 Tips for Success</h2>
              <ul style={styles.tipsList}>
                {studyPlan.tipsForSuccess.map((tip, idx) => (
                  <li key={idx} style={styles.tipItem}>{tip}</li>
                ))}
              </ul>
            </div>

            <div style={styles.actionButtons}>
              <button
                onClick={() => {
                  setStep('intro');
                  setCurrentQuestion(0);
                  setAnswers({});
                  setSelectedDocs([]);
                  setStudyPlan(null);
                }}
                style={styles.regenerateBtn}
              >
                🔄 Create New Plan
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                style={styles.dashboardBtn}
              >
                📊 Back to Dashboard
              </button>
            </div>
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
  card: {
    background: 'rgba(50, 45, 90, 0.6)',
    border: '1px solid rgba(201, 169, 97, 0.15)',
    borderRadius: '12px',
    padding: '40px',
    backdropFilter: 'blur(8px)',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  subtitle: {
    margin: '0 0 30px 0',
    fontSize: '16px',
    color: '#9ca3af',
  },
  introContent: {
    textAlign: 'center',
  },
  introText: {
    fontSize: '14px',
    color: '#d1d5db',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  feature: {
    background: 'rgba(201, 169, 97, 0.1)',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
  },
  featureIcon: {
    fontSize: '28px',
    margin: '0 0 10px 0',
  },
  featureText: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af',
  },
  startBtn: {
    padding: '14px 40px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
  },
  progressContainer: {
    marginBottom: '30px',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #c9a961 0%, #d4a765 100%)',
    transition: 'width 0.3s ease',
  },
  progressText: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af',
  },
  questionTitle: {
    margin: '0 0 25px 0',
    fontSize: '22px',
    fontWeight: '600',
    color: '#c9a961',
  },
  optionsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    marginBottom: '30px',
  },
  optionBtn: {
    padding: '14px 16px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.3s',
    textAlign: 'left',
  },
  documentSelection: {
    background: 'rgba(100, 200, 150, 0.05)',
    border: '1px solid rgba(100, 200, 150, 0.2)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '25px',
  },
  docTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4ade80',
  },
  docSubtitle: {
    margin: '0 0 15px 0',
    fontSize: '12px',
    color: '#9ca3af',
  },
  noDocText: {
    margin: 0,
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  docsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  docCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '10px',
    background: 'rgba(201, 169, 97, 0.05)',
    borderRadius: '6px',
    fontSize: '13px',
  },
  checkboxInput: {
    cursor: 'pointer',
  },
  checkboxLabel: {
    color: '#d1d5db',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: '12px 24px',
    background: 'rgba(201, 169, 97, 0.2)',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    color: '#c9a961',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
  nextButton: {
    padding: '12px 24px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
  resultsHeader: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  resultsTitle: {
    margin: '0 0 10px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  resultsSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#9ca3af',
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#c9a961',
    borderBottom: '1px solid rgba(201, 169, 97, 0.2)',
    paddingBottom: '10px',
  },
  overviewSection: {
    marginBottom: '30px',
  },
  overviewText: {
    margin: 0,
    fontSize: '13px',
    color: '#d1d5db',
    lineHeight: '1.6',
  },
  methodSection: {
    background: 'rgba(100, 200, 150, 0.05)',
    border: '1px solid rgba(100, 200, 150, 0.2)',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '30px',
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
  weekGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  dayCard: {
    background: 'rgba(201, 169, 97, 0.1)',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
  },
  dayName: {
    margin: '0 0 6px 0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#c9a961',
  },
  dayTopic: {
    margin: '0 0 4px 0',
    fontSize: '11px',
    color: '#d1d5db',
  },
  dayDuration: {
    margin: '0 0 4px 0',
    fontSize: '10px',
    color: '#9ca3af',
  },
  dayTechnique: {
    margin: 0,
    fontSize: '10px',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  routineSection: {
    marginBottom: '30px',
  },
  routineItem: {
    display: 'flex',
    gap: '15px',
    padding: '12px',
    background: 'rgba(30, 25, 60, 0.8)',
    borderRadius: '6px',
    marginBottom: '10px',
    alignItems: 'flex-start',
    fontSize: '12px',
  },
  routineTime: {
    color: '#c9a961',
    fontWeight: '600',
    minWidth: '60px',
  },
  routineActivity: {
    color: '#d1d5db',
    flex: 1,
  },
  routineTip: {
    color: '#9ca3af',
    fontSize: '11px',
  },
  techniquesSection: {
    marginBottom: '30px',
  },
  techniqueCard: {
    background: 'rgba(100, 200, 150, 0.05)',
    border: '1px solid rgba(100, 200, 150, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px',
  },
  techniqueName: {
    margin: '0 0 6px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4ade80',
  },
  techniqueDescription: {
    margin: '0 0 6px 0',
    fontSize: '12px',
    color: '#d1d5db',
  },
  techniqueWhen: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
  },
  goalsSection: {
    marginBottom: '30px',
  },
  milestoneItem: {
    display: 'flex',
    gap: '15px',
    padding: '12px',
    background: 'rgba(201, 169, 97, 0.05)',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  milestoneWeek: {
    color: '#c9a961',
    fontWeight: '600',
    minWidth: '80px',
    fontSize: '12px',
  },
  milestoneGoal: {
    color: '#d1d5db',
    fontSize: '12px',
  },
  tipsSection: {
    marginBottom: '30px',
  },
  tipsList: {
    margin: 0,
    paddingLeft: '20px',
  },
  tipItem: {
    color: '#d1d5db',
    fontSize: '12px',
    marginBottom: '8px',
    lineHeight: '1.5',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
    borderTop: '1px solid rgba(201, 169, 97, 0.2)',
    paddingTop: '30px',
  },
  regenerateBtn: {
    flex: 1,
    padding: '12px 20px',
    background: 'rgba(201, 169, 97, 0.2)',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    color: '#c9a961',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
  dashboardBtn: {
    flex: 1,
    padding: '12px 20px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
};

export default SmartStudyPlan;
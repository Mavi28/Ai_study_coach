import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const QuizGeneratorReal = ({ onNavigate }) => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard

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
    } finally {
      setLoading(false);
    }
  };

  const generateQuizWithGroq = async () => {
    if (!selectedDoc) {
      alert('Please select a document');
      return;
    }

    setGeneratingQuiz(true);

    try {
      // Get document
      const docRes = await fetch(`/api/documents/${selectedDoc}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const docData = await docRes.json();
      const document = docData.document;

      if (!document || !document.fullText) {
        throw new Error('Document content not available');
      }

      console.log('🤖 Generating quiz with Groq...');

      // Call backend to generate quiz with Groq
      const quizRes = await fetch('/api/questions/generate-quiz', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: selectedDoc,
          documentContent: document.fullText,
          difficulty: difficulty,
          numQuestions: 5,
        }),
      });

      if (!quizRes.ok) {
        const error = await quizRes.json();
        throw new Error(error.error || 'Failed to generate quiz');
      }

      const quizData = await quizRes.json();

      setQuiz({
        title: `Quiz: ${document.fileName}`,
        difficulty: difficulty,
        questions: quizData.questions,
        documentId: selectedDoc,
      });

      setAnswers({});
      setSubmitted(false);
      setScore(null);
    } catch (err) {
      console.error('Error generating quiz:', err);
      alert('Error: ' + err.message);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex,
    });
  };

  const submitQuiz = () => {
    let correctCount = 0;
    
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    setScore({
      correct: correctCount,
      total: quiz.questions.length,
      percentage: percentage,
    });
    setSubmitted(true);
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
        <h1 style={styles.pageTitle}>📝 AI Quiz Generator</h1>
        <p style={styles.pageSubtitle}>Generate real quizzes powered by Groq AI</p>

        {!quiz ? (
          // Document Selection
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>📚 Select Document & Difficulty</h2>
            
            {loading ? (
              <p style={styles.loadingText}>Loading documents...</p>
            ) : documents.length === 0 ? (
              <p style={styles.emptyText}>No documents available. Upload one first!</p>
            ) : (
              <>
                {/* Document List */}
                <div style={styles.documentList}>
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

                {/* Difficulty Selection */}
                <div style={styles.difficultySection}>
                  <h3 style={styles.difficultyTitle}>Choose Difficulty</h3>
                  <div style={styles.difficultyButtons}>
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        style={{
                          ...styles.difficultyBtn,
                          background: difficulty === level ? '#c9a961' : 'rgba(201, 169, 97, 0.2)',
                          color: difficulty === level ? '#0f0f1e' : '#c9a961',
                        }}
                      >
                        {level === 'easy' ? '🟢 Easy' : level === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateQuizWithGroq}
                  disabled={!selectedDoc || generatingQuiz}
                  style={{
                    ...styles.generateBtn,
                    opacity: !selectedDoc || generatingQuiz ? 0.6 : 1,
                  }}
                >
                  {generatingQuiz ? '🤖 Generating Quiz...' : '🚀 Generate Quiz'}
                </button>
              </>
            )}
          </div>
        ) : submitted && score ? (
          // Results Screen
          <div style={styles.card}>
            <div style={styles.resultsContainer}>
              <h2 style={styles.resultsTitle}>🎉 Quiz Complete!</h2>
              
              <div style={styles.scoreDisplay}>
                <div style={styles.scoreCircle}>
                  <p style={styles.scorePercent}>{score.percentage}%</p>
                </div>
                <p style={styles.scoreText}>
                  You got {score.correct} out of {score.total} questions correct
                </p>
              </div>

              <div style={styles.performanceBar}>
                <div
                  style={{
                    ...styles.performanceFill,
                    width: `${score.percentage}%`,
                    background: score.percentage >= 80
                      ? '#4ade80'
                      : score.percentage >= 60
                      ? '#fbbf24'
                      : '#f87171',
                  }}
                ></div>
              </div>

              <p style={{
                ...styles.performanceText,
                color: score.percentage >= 80
                  ? '#4ade80'
                  : score.percentage >= 60
                  ? '#fbbf24'
                  : '#f87171',
              }}>
                {score.percentage >= 80
                  ? '🌟 Excellent! You\'ve mastered this material!'
                  : score.percentage >= 60
                  ? '📈 Good effort! Review weak areas.'
                  : '💪 Keep practicing! You\'ll improve.'}
              </p>

              {/* Answer Review */}
              <div style={styles.answerReview}>
                <h3 style={styles.reviewTitle}>📋 Answer Review</h3>
                {quiz.questions.map((q) => (
                  <div key={q.id} style={styles.reviewItem}>
                    <p style={styles.reviewQuestion}>{q.question}</p>
                    <p style={{
                      ...styles.reviewAnswer,
                      color: answers[q.id] === q.correctIndex ? '#4ade80' : '#f87171',
                    }}>
                      {answers[q.id] === q.correctIndex ? '✓' : '✗'} Your answer: {q.options[answers[q.id]]}
                    </p>
                    {answers[q.id] !== q.correctIndex && (
                      <p style={styles.correctAnswer}>
                        ✓ Correct answer: {q.options[q.correctIndex]}
                      </p>
                    )}
                    <p style={styles.explanation}>{q.explanation}</p>
                  </div>
                ))}
              </div>

              <div style={styles.buttons}>
                <button
                  onClick={() => setQuiz(null)}
                  style={styles.retakeBtn}
                >
                  🔄 Generate New Quiz
                </button>
                <button
                  onClick={() => onNavigate('dashboard')}
                  style={styles.backBtnStyle}
                >
                  📊 Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Quiz Taking
          <div style={styles.card}>
            <div style={styles.quizHeader}>
              <h2 style={styles.quizTitle}>{quiz.title}</h2>
              <span style={styles.difficultyBadge}>
                {quiz.difficulty === 'easy' ? '🟢' : quiz.difficulty === 'medium' ? '🟡' : '🔴'} {quiz.difficulty.toUpperCase()}
              </span>
            </div>
            
            <p style={styles.quizProgress}>
              {Object.keys(answers).length} of {quiz.questions.length} answered
            </p>

            <div style={styles.questionsList}>
              {quiz.questions.map((q, i) => (
                <div key={q.id} style={styles.questionCard}>
                  <h3 style={styles.questionNumber}>
                    Question {i + 1} of {quiz.questions.length}
                  </h3>
                  <p style={styles.questionText}>{q.question}</p>

                  <div style={styles.optionsList}>
                    {q.options.map((option, optionIndex) => (
                      <label key={optionIndex} style={styles.optionLabel}>
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={optionIndex}
                          checked={answers[q.id] === optionIndex}
                          onChange={() => handleAnswerChange(q.id, optionIndex)}
                          style={styles.radioInput}
                        />
                        <span style={styles.optionText}>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length !== quiz.questions.length}
              style={{
                ...styles.submitBtn,
                opacity: Object.keys(answers).length === quiz.questions.length ? 1 : 0.6,
              }}
            >
              ✅ Submit Quiz
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
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '25px',
  },
  docItem: {
    padding: '15px',
    background: 'rgba(201, 169, 97, 0.05)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
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
  difficultySection: {
    marginBottom: '25px',
    padding: '20px',
    background: 'rgba(201, 169, 97, 0.05)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
  },
  difficultyTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9a961',
  },
  difficultyButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '10px',
  },
  difficultyBtn: {
    padding: '10px 15px',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    transition: 'all 0.3s',
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
  quizHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  quizTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#c9a961',
  },
  difficultyBadge: {
    fontSize: '14px',
    padding: '4px 12px',
    background: 'rgba(201, 169, 97, 0.15)',
    borderRadius: '4px',
    color: '#c9a961',
  },
  quizProgress: {
    margin: '0 0 20px 0',
    fontSize: '12px',
    color: '#9ca3af',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px',
  },
  questionCard: {
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '8px',
    padding: '20px',
  },
  questionNumber: {
    margin: '0 0 10px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#c9a961',
  },
  questionText: {
    margin: '0 0 15px 0',
    fontSize: '14px',
    color: '#fff',
    fontWeight: '500',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    cursor: 'pointer',
    padding: '10px',
    background: 'rgba(201, 169, 97, 0.05)',
    borderRadius: '6px',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    transition: 'all 0.2s',
  },
  radioInput: {
    marginTop: '2px',
    marginRight: '10px',
    cursor: 'pointer',
  },
  optionText: {
    fontSize: '12px',
    color: '#d1d5db',
  },
  submitBtn: {
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
  resultsContainer: {
    textAlign: 'center',
  },
  resultsTitle: {
    margin: '0 0 30px 0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  scoreDisplay: {
    marginBottom: '30px',
  },
  scoreCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #c9a961 0%, #d4a765 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
  },
  scorePercent: {
    margin: 0,
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#0f0f1e',
  },
  scoreText: {
    margin: 0,
    fontSize: '14px',
    color: '#9ca3af',
  },
  performanceBar: {
    height: '8px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '15px',
  },
  performanceFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease-out',
  },
  performanceText: {
    margin: '0 0 30px 0',
    fontSize: '14px',
    fontWeight: '600',
  },
  answerReview: {
    textAlign: 'left',
    marginBottom: '30px',
    borderTop: '1px solid rgba(201, 169, 97, 0.1)',
    paddingTop: '20px',
  },
  reviewTitle: {
    margin: '0 0 15px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#c9a961',
  },
  reviewItem: {
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px',
  },
  reviewQuestion: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#d1d5db',
    fontWeight: '500',
  },
  reviewAnswer: {
    margin: '0 0 5px 0',
    fontSize: '12px',
    fontWeight: '600',
  },
  correctAnswer: {
    margin: '0 0 5px 0',
    fontSize: '11px',
    color: '#4ade80',
  },
  explanation: {
    margin: 0,
    fontSize: '11px',
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  buttons: {
    display: 'flex',
    gap: '15px',
  },
  retakeBtn: {
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
  backBtnStyle: {
    flex: 1,
    padding: '12px 20px',
    background: 'rgba(201, 169, 97, 0.2)',
    border: '1px solid rgba(201, 169, 97, 0.4)',
    color: '#c9a961',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
};

export default QuizGeneratorReal;
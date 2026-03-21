import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// ✅ ADD THIS LINE AT THE TOP
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DocumentUploadEnhanced = ({ onNavigate }) => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [asking, setAsking] = useState(false);
  const [streamingAnswer, setStreamingAnswer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
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
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 200);

      // ✅ UPDATED: Use API_URL
      const res = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setFile(null);
      setUploadProgress(0);
      setTimeout(() => fetchDocuments(), 500);
      alert('✅ Document uploaded successfully! Processing started.');
    } catch (err) {
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim() || !selectedDoc) {
      setError('Please select a document and enter a question');
      return;
    }

    setAsking(true);
    setError('');
    setStreamingAnswer('');

    try {
      // ✅ UPDATED: Use API_URL
      const res = await fetch(`${API_URL}/api/questions/ask`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: selectedDoc,
          question: question,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      // Simulate streaming answer (word by word)
      const words = data.answer.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 30)); // Delay between words
        currentText += (i > 0 ? ' ' : '') + words[i];
        setStreamingAnswer(currentText);
      }

      // Add to chat history
      const newChat = {
        id: Date.now(),
        q: question,
        a: data.answer,
        sources: data.sourceChunks || [],
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatHistory([newChat, ...chatHistory]);
      setQuestion('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAsking(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Delete this document?')) return;

    try {
      // ✅ UPDATED: Use API_URL
      const res = await fetch(`${API_URL}/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredChat = chatHistory.filter(
    (chat) =>
      chat.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
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
        {/* Two Column Layout - Responsive */}
        <div style={styles.twoColumn}>
          {/* Left Column - Documents & Upload */}
          <div style={styles.leftPanel}>
            {/* Upload Section */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>📤 Upload Document</h2>
              <form onSubmit={handleUpload} style={styles.form}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={styles.fileInput}
                />
                <button
                  type="submit"
                  disabled={uploading || !file}
                  style={{
                    ...styles.submitBtn,
                    opacity: uploading || !file ? 0.6 : 1,
                  }}
                >
                  {uploading ? '⏳ Uploading...' : '📁 Upload PDF'}
                </button>
              </form>

              {/* Progress Bar */}
              {uploading && (
                <div style={styles.progressContainer}>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${uploadProgress}%`,
                      }}
                    ></div>
                  </div>
                  <p style={styles.progressText}>{Math.round(uploadProgress)}% Complete</p>
                </div>
              )}

              {error && <div style={styles.error}>{error}</div>}
            </div>

            {/* Documents List */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>📚 Your Documents</h2>
              {loading ? (
                <p style={styles.emptyText}>Loading...</p>
              ) : documents.length === 0 ? (
                <p style={styles.emptyText}>No documents yet. Upload one to get started!</p>
              ) : (
                <div style={styles.documentsList}>
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => setSelectedDoc(doc._id)}
                      style={{
                        ...styles.documentItem,
                        background: selectedDoc === doc._id
                          ? 'rgba(201, 169, 97, 0.2)'
                          : 'rgba(201, 169, 97, 0.05)',
                        borderColor: selectedDoc === doc._id
                          ? '#c9a961'
                          : 'rgba(201, 169, 97, 0.1)',
                      }}
                    >
                      <div>
                        <p style={styles.docName}>{doc.fileName}</p>
                        <p style={styles.docMeta}>
                          {doc.totalPages} pages • {doc.totalChunks} chunks
                        </p>
                        <div style={styles.statusBadge}>
                          {doc.processingStatus === 'completed' ? '✅ Ready' : '⏳ Processing'}
                        </div>
                      </div>
                      <div style={styles.docActions}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc._id);
                          }}
                          style={styles.deleteBtn}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Chat */}
          <div style={styles.rightPanel}>
            {/* Search Chat */}
            {chatHistory.length > 0 && (
              <div style={styles.card}>
                <input
                  type="text"
                  placeholder="🔍 Search chat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            )}

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>💬 Ask Questions</h2>

              {selectedDoc ? (
                <>
                  {/* Chat Display */}
                  <div style={styles.chatContainer}>
                    {/* Chat History */}
                    {filteredChat.map((chat) => (
                      <div key={chat.id} style={styles.chatMessage}>
                        {/* User Question */}
                        <div style={styles.userMessage}>
                          <div style={styles.messageBubble}>
                            <p style={styles.messageText}>{chat.q}</p>
                            <p style={styles.messageTime}>{chat.timestamp}</p>
                          </div>
                        </div>

                        {/* AI Answer */}
                        <div style={styles.aiMessage}>
                          <div style={styles.messageBubble}>
                            <p style={styles.messageText}>{chat.a}</p>
                            <div style={styles.messageActions}>
                              <button
                                onClick={() => copyToClipboard(chat.a)}
                                style={styles.actionBtn}
                              >
                                📋 Copy
                              </button>
                              {chat.sources?.length > 0 && (
                                <span style={styles.sourceInfo}>
                                  📌 {chat.sources.length} source(s)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Streaming Answer */}
                    {asking && (
                      <div style={styles.chatMessage}>
                        <div style={styles.aiMessage}>
                          <div style={styles.messageBubble}>
                            <p style={styles.messageText}>
                              {streamingAnswer}
                              <span style={styles.typingCursor}>▌</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Question Input */}
                  <form onSubmit={handleAskQuestion} style={styles.chatForm}>
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask about your document..."
                      style={styles.questionInput}
                      disabled={asking}
                    />
                    <button
                      type="submit"
                      disabled={asking || !question.trim()}
                      style={{
                        ...styles.askBtn,
                        opacity: asking || !question.trim() ? 0.6 : 1,
                      }}
                    >
                      {asking ? '⏳' : '✨'}
                    </button>
                  </form>
                </>
              ) : (
                <div style={styles.noDocSelected}>
                  <p style={styles.emptyText}>👈 Select a document to ask questions</p>
                </div>
              )}
            </div>
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
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    background: 'rgba(50, 45, 90, 0.6)',
    border: '1px solid rgba(201, 169, 97, 0.15)',
    borderRadius: '12px',
    padding: '20px',
    backdropFilter: 'blur(8px)',
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#c9a961',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  fileInput: {
    flex: 1,
    padding: '10px',
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
  },
  submitBtn: {
    padding: '10px 20px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  progressContainer: {
    marginBottom: '15px',
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
    background: 'linear-gradient(90deg, #c9a961 0%, #d4a765 100%)',
    borderRadius: '3px',
    transition: 'width 0.2s ease',
  },
  progressText: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '12px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
    fontSize: '13px',
  },
  documentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  documentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'rgba(201, 169, 97, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(201, 169, 97, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  docName: {
    fontSize: '12px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    color: '#fff',
  },
  docMeta: {
    fontSize: '10px',
    color: '#9ca3af',
    margin: '0 0 6px 0',
  },
  statusBadge: {
    display: 'inline-block',
    fontSize: '10px',
    padding: '3px 8px',
    background: 'rgba(201, 169, 97, 0.15)',
    color: '#c9a961',
    borderRadius: '4px',
  },
  docActions: {
    display: 'flex',
    gap: '6px',
  },
  deleteBtn: {
    padding: '4px 8px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
  },
  noDocSelected: {
    textAlign: 'center',
    padding: '30px 20px',
    background: 'rgba(201, 169, 97, 0.05)',
    borderRadius: '8px',
    border: '1px dashed rgba(201, 169, 97, 0.2)',
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '400px',
    overflowY: 'auto',
    marginBottom: '15px',
    padding: '10px 0',
  },
  chatMessage: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  userMessage: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  aiMessage: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  messageBubble: {
    background: 'rgba(201, 169, 97, 0.15)',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    borderRadius: '12px',
    padding: '10px 12px',
    maxWidth: '80%',
  },
  messageText: {
    margin: '0 0 4px 0',
    fontSize: '12px',
    color: '#d1d5db',
    lineHeight: '1.4',
  },
  messageTime: {
    margin: 0,
    fontSize: '9px',
    color: '#6b7280',
  },
  messageActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '6px',
    alignItems: 'center',
  },
  actionBtn: {
    fontSize: '10px',
    padding: '2px 6px',
    background: 'rgba(0, 0, 0, 0.2)',
    border: 'none',
    color: '#9ca3af',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  sourceInfo: {
    fontSize: '9px',
    color: '#c9a961',
  },
  typingCursor: {
    animation: 'blink 1s infinite',
    marginLeft: '2px',
  },
  chatForm: {
    display: 'flex',
    gap: '8px',
  },
  questionInput: {
    flex: 1,
    padding: '10px',
    background: 'rgba(30, 25, 60, 0.8)',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
  },
  askBtn: {
    padding: '10px 15px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },

  // Media query styles (will need CSS for true responsiveness)
  '@media (max-width: 768px)': {
    twoColumn: {
      gridTemplateColumns: '1fr',
    },
  },
};

// Add blinking cursor animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);

export default DocumentUploadEnhanced;
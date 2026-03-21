import React, { useState, useEffect, useRef } from 'react';

const FocusTimerEnhanced = ({ onNavigate }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [timerMode, setTimerMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [showNotification, setShowNotification] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [streak, setStreak] = useState(0);
  const [lastStreakDate, setLastStreakDate] = useState(null);
  const audioRef = useRef(null);

  const motivationalQuotes = [
    "The only impossible journey is the one you never begin.",
    "Excellence is not a single act but a habit.",
    "Where focus goes, energy flows.",
    "You don't have to see the whole staircase, just take the first step.",
    "The quality of your life is determined by the quality of the questions you ask.",
    "You become what you repeatedly do.",
    "Success is doing what you hate to do, but nonetheless doing it like you love it.",
    "If you talk about it, it's a dream. If you envision it, it's possible.",
    "The biggest risk is not taking any risk.",
    "Your limitation—it's only your imagination.",
  ];

  // Load streak from localStorage
  useEffect(() => {
    const savedStreak = localStorage.getItem('focusStreak');
    const savedDate = localStorage.getItem('lastStreakDate');
    
    if (savedStreak && savedDate) {
      const lastDate = new Date(savedDate);
      const today = new Date();
      
      // Check if it's been more than 24 hours
      const hoursDiff = (today - lastDate) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        // Reset streak after 24 hours
        setStreak(0);
        localStorage.setItem('focusStreak', '0');
      } else {
        setStreak(parseInt(savedStreak));
      }
    }
    
    setLastStreakDate(new Date());
  }, []);

  // Play music continuously
  useEffect(() => {
    if (isRunning && !isMusicPlaying) {
      playMusic();
    } else if (!isRunning && isMusicPlaying) {
      stopMusic();
    }

    return () => {
      if (isMusicPlaying) {
        stopMusic();
      }
    };
  }, [isRunning]);

  // Main timer logic
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsRunning(false);
            playNotification();
            
            if (timerMode === 'work') {
              // Work session completed
              const newStreak = streak + 1;
              setStreak(newStreak);
              localStorage.setItem('focusStreak', newStreak.toString());
              localStorage.setItem('lastStreakDate', new Date().toISOString());
              
              setSessionsCompleted(sessionsCompleted + 1);
              showBreakNotification();
              setTimerMode('shortBreak');
              setMinutes(5);
            } else {
              // Break completed
              setTimerMode('work');
              setMinutes(25);
              showWorkNotification();
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds, timerMode, sessionsCompleted, streak]);

  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
      audioRef.current.loop = true;
      audioRef.current.play().catch(err => {
        console.log('Autoplay blocked');
      });
      setIsMusicPlaying(true);
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
  };

  const playNotification = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const showBreakNotification = () => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setCurrentQuote(randomQuote);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 10000);
  };

  const showWorkNotification = () => {
    setShowNotification(false);
  };

  const addMinutes = (amount) => {
    if (timerMode === 'work') {
      setMinutes(Math.max(1, minutes + amount));
    } else {
      setMinutes(Math.max(1, minutes + amount));
    }
  };

  const setBreakType = (breakType) => {
    setIsRunning(false);
    setTimerMode(breakType);
    
    if (breakType === 'shortBreak') {
      setMinutes(5);
    } else if (breakType === 'longBreak') {
      setMinutes(15);
    }
    
    setSeconds(0);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - windowPosition.x,
      y: e.clientY - windowPosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setWindowPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const audioElement = (
    <audio ref={audioRef} preload="auto">
      <source src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_ambient_relax.mp3" type="audio/mpeg" />
    </audio>
  );

  // Minimized view
  if (isMinimized) {
    return (
      <>
        {audioElement}
        <div style={styles.navbar}>
          <div style={styles.navLeft}>
            <span style={styles.owl}>🦉</span>
            <h1 style={styles.brandName}>StudyCoach</h1>
          </div>
          <button onClick={() => onNavigate('dashboard')} style={styles.backBtn}>
            ← Back
          </button>
        </div>
        
        <div
          style={{
            ...styles.floatingWindow,
            left: `${windowPosition.x}px`,
            top: `${windowPosition.y}px`,
          }}
          onMouseDown={handleMouseDown}
        >
          <div style={styles.minimizedHeader}>
            <div style={styles.minimizedTime}>{timeString}</div>
            <button onClick={() => setIsMinimized(false)} style={styles.expandBtn}>⛶</button>
          </div>
          <div style={styles.minimizedControls}>
            <button onClick={() => setIsRunning(!isRunning)} style={{...styles.miniBtn, background: isRunning ? '#ef4444' : '#c9a961'}}>
              {isRunning ? '⏸' : '▶'}
            </button>
            <button onClick={() => setIsRunning(false)} style={styles.miniBtn}>⏹</button>
          </div>
          <p style={styles.minimizedMode}>
            {timerMode === 'work' ? '🎯' : timerMode === 'shortBreak' ? '☕' : '🌟'} {sessionsCompleted}
          </p>
          {isMusicPlaying && <p style={styles.musicIndicator}>🎵</p>}
        </div>

        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>⏱️ Timer Running</h2>
              <p style={styles.hint}>Timer is minimized and running in the corner</p>
              <button onClick={() => setIsMinimized(false)} style={styles.expandFullBtn}>
                📍 Show Full Timer
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Full view
  return (
    <div style={styles.container}>
      {audioElement}

      {showNotification && (
        <div style={styles.notificationOverlay}>
          <div style={styles.notificationCard}>
            <h2 style={styles.notificationTitle}>🎉 Great Work!</h2>
            <p style={styles.notificationQuote}>"{currentQuote}"</p>
            <p style={styles.notificationAuthor}>— Tony Robbins</p>
            <button onClick={() => setShowNotification(false)} style={styles.notificationBtn}>
              Continue ✨
            </button>
          </div>
        </div>
      )}

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
        <div style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <div>
              <h1 style={styles.title}>⏱️ Focus Timer</h1>
              <p style={styles.subtitle}>
                {timerMode === 'work' ? '🎯 Work Session' : timerMode === 'shortBreak' ? '☕ Short Break' : '🌟 Long Break'}
                {isMusicPlaying && ' 🎵'}
              </p>
            </div>
            <button onClick={() => setIsMinimized(true)} style={styles.minimizeBtn}>
              ➖ Minimize
            </button>
          </div>

          <div style={styles.timerDisplay}>
            <div style={styles.timerText}>{timeString}</div>
          </div>

          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: timerMode === 'work'
                    ? `${100 - (minutes / 25 * 100)}%`
                    : timerMode === 'shortBreak'
                    ? `${100 - (minutes / 5 * 100)}%`
                    : `${100 - (minutes / 15 * 100)}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Timer Controls */}
          <div style={styles.controls}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                ...styles.btn,
                background: isRunning ? '#ef4444' : '#c9a961',
                color: isRunning ? '#fff' : '#0f0f1e',
              }}
            >
              {isRunning ? '⏸️ Pause' : '▶️ Start'}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setTimerMode('work');
                setMinutes(25);
                setSeconds(0);
              }}
              style={styles.btn}
            >
              🔄 Reset
            </button>
            <button onClick={() => setIsRunning(false)} style={styles.btn}>
              ⏹️ Stop
            </button>
          </div>

          {/* Add/Minus Minutes */}
          <div style={styles.adjustSection}>
            <p style={styles.adjustLabel}>Adjust Time</p>
            <div style={styles.adjustButtons}>
              <button onClick={() => addMinutes(-5)} style={styles.adjustBtn}>➖ 5 min</button>
              <button onClick={() => addMinutes(-1)} style={styles.adjustBtn}>➖ 1 min</button>
              <button onClick={() => addMinutes(1)} style={styles.adjustBtn}>➕ 1 min</button>
              <button onClick={() => addMinutes(5)} style={styles.adjustBtn}>➕ 5 min</button>
            </div>
          </div>

          {/* Break Type Selection */}
          <div style={styles.breakSection}>
            <p style={styles.breakLabel}>Break Type</p>
            <div style={styles.breakButtons}>
              <button
                onClick={() => setBreakType('shortBreak')}
                style={{
                  ...styles.breakBtn,
                  background: timerMode === 'shortBreak' ? '#c9a961' : 'rgba(201, 169, 97, 0.2)',
                  color: timerMode === 'shortBreak' ? '#0f0f1e' : '#c9a961',
                }}
              >
                ☕ Short (5 min)
              </button>
              <button
                onClick={() => setBreakType('longBreak')}
                style={{
                  ...styles.breakBtn,
                  background: timerMode === 'longBreak' ? '#c9a961' : 'rgba(201, 169, 97, 0.2)',
                  color: timerMode === 'longBreak' ? '#0f0f1e' : '#c9a961',
                }}
              >
                🌟 Long (15 min)
              </button>
            </div>
          </div>

          {/* Music Volume Control */}
          <div style={styles.musicControl}>
            <p style={styles.musicLabel}>🎵 Music Volume</p>
            <input
              type="range"
              min="0"
              max="100"
              value={musicVolume * 100}
              onChange={(e) => {
                const vol = e.target.value / 100;
                setMusicVolume(vol);
                if (audioRef.current) {
                  audioRef.current.volume = vol;
                }
              }}
              style={styles.volumeSlider}
            />
            <p style={styles.volumePercent}>{Math.round(musicVolume * 100)}%</p>
          </div>

          {/* Stats */}
          <div style={styles.stats}>
            <div style={styles.stat}>
              <p style={styles.statLabel}>Sessions</p>
              <p style={styles.statValue}>{sessionsCompleted}</p>
            </div>
            <div style={styles.stat}>
              <p style={styles.statLabel}>Total Time</p>
              <p style={styles.statValue}>{sessionsCompleted * 25} min</p>
            </div>
            <div style={styles.stat}>
              <p style={styles.statLabel}>🔥 Streak</p>
              <p style={styles.statValue}>{streak}</p>
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
  floatingWindow: {
    position: 'fixed',
    background: 'rgba(50, 45, 90, 0.95)',
    border: '2px solid rgba(201, 169, 97, 0.3)',
    borderRadius: '12px',
    padding: '15px',
    backdropFilter: 'blur(10px)',
    zIndex: 1000,
    cursor: 'grab',
    minWidth: '200px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
  },
  minimizedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  minimizedTime: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#c9a961',
    fontFamily: 'Courier New, monospace',
  },
  expandBtn: {
    background: 'rgba(201, 169, 97, 0.2)',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    color: '#c9a961',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  minimizedControls: {
    display: 'flex',
    gap: '6px',
    marginBottom: '8px',
  },
  miniBtn: {
    flex: 1,
    padding: '6px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
  },
  minimizedMode: {
    margin: '8px 0 0',
    fontSize: '13px',
    color: '#9ca3af',
    textAlign: 'center',
  },
  musicIndicator: {
    margin: '4px 0 0',
    fontSize: '12px',
    textAlign: 'center',
    color: '#4ade80',
  },
  content: {
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  mainCard: {
    background: 'rgba(50, 45, 90, 0.6)',
    border: '1px solid rgba(201, 169, 97, 0.15)',
    borderRadius: '12px',
    padding: '40px',
    backdropFilter: 'blur(8px)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#9ca3af',
  },
  minimizeBtn: {
    padding: '10px 15px',
    background: 'rgba(201, 169, 97, 0.2)',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    color: '#c9a961',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
  timerDisplay: {
    background: 'rgba(201, 169, 97, 0.15)',
    border: '2px solid rgba(201, 169, 97, 0.3)',
    borderRadius: '12px',
    padding: '40px',
    marginBottom: '30px',
  },
  timerText: {
    fontSize: '72px',
    fontWeight: 'bold',
    color: '#c9a961',
    margin: 0,
    fontFamily: 'Courier New, monospace',
  },
  progressContainer: {
    marginBottom: '30px',
  },
  progressBar: {
    height: '6px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #c9a961 0%, #d4a765 100%)',
    borderRadius: '3px',
    transition: 'width 1s linear',
  },
  controls: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
  },
  btn: {
    padding: '12px 24px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
  adjustSection: {
    background: 'rgba(201, 169, 97, 0.1)',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  },
  adjustLabel: {
    margin: '0 0 10px 0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#c9a961',
  },
  adjustButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '8px',
  },
  adjustBtn: {
    padding: '8px 12px',
    background: 'rgba(201, 169, 97, 0.2)',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    color: '#c9a961',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  breakSection: {
    background: 'rgba(100, 200, 150, 0.1)',
    border: '1px solid rgba(100, 200, 150, 0.2)',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  },
  breakLabel: {
    margin: '0 0 10px 0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#4ade80',
  },
  breakButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '8px',
  },
  breakBtn: {
    padding: '10px 15px',
    border: '1px solid rgba(201, 169, 97, 0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '12px',
    transition: 'all 0.3s',
  },
  musicControl: {
    background: 'rgba(100, 200, 150, 0.1)',
    border: '1px solid rgba(100, 200, 150, 0.2)',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  },
  musicLabel: {
    margin: '0 0 10px 0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#4ade80',
  },
  volumeSlider: {
    width: '100%',
    marginBottom: '8px',
    cursor: 'pointer',
  },
  volumePercent: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    borderTop: '1px solid rgba(201, 169, 97, 0.1)',
    paddingTop: '25px',
  },
  stat: {
    background: 'rgba(201, 169, 97, 0.1)',
    border: '1px solid rgba(201, 169, 97, 0.2)',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
  },
  statLabel: {
    margin: '0 0 8px 0',
    fontSize: '11px',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  statValue: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#c9a961',
  },
  notificationOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  notificationCard: {
    background: 'linear-gradient(135deg, #c9a961 0%, #d4a765 100%)',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '500px',
    textAlign: 'center',
    color: '#0f0f1e',
    boxShadow: '0 20px 60px rgba(201, 169, 97, 0.3)',
  },
  notificationTitle: {
    margin: '0 0 20px 0',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  notificationQuote: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontStyle: 'italic',
    lineHeight: '1.6',
  },
  notificationAuthor: {
    margin: '0 0 25px 0',
    fontSize: '13px',
    fontWeight: '600',
    opacity: 0.8,
  },
  notificationBtn: {
    padding: '12px 30px',
    background: '#0f0f1e',
    color: '#c9a961',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  expandFullBtn: {
    padding: '12px 24px',
    background: '#c9a961',
    color: '#0f0f1e',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
  hint: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '10px 0',
  },
};

export default FocusTimerEnhanced;
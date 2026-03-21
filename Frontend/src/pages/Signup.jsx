import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Signup = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await signup(email, password, name);
    if (result.success) {
      onNavigate('dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>AI Study Coach</h1>
        <p style={styles.subtitle}>Create Your Account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={{...styles.button, opacity: loading ? 0.6 : 1}}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} style={styles.link}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' },
  card: { background: 'white', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
  title: { fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' },
  subtitle: { fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '30px' },
  form: { marginBottom: '20px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' },
  input: { width: '100%', padding: '12px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit' },
  button: { width: '100%', padding: '12px', fontSize: '16px', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  error: { background: '#fee', color: '#c33', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fcc' },
  switchText: { textAlign: 'center', fontSize: '14px', color: '#666' },
  link: { background: 'none', border: 'none', color: '#667eea', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' },
};

export default Signup;
import { useState } from 'react';
import api from '../../api/client.js';

export default function AuthPanel({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = mode === 'login' ? { email, password } : { email, password, name };
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem('journal_token', data.token);
      localStorage.setItem('journal_user', JSON.stringify(data.user));
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
      {mode === 'register' && <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />}
      <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <div className="error">{error}</div>}
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
        </button>
        <button className="btn btn-primary" onClick={submit} disabled={loading || !email || !password}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create'}
        </button>
      </div>
    </div>
  );
}

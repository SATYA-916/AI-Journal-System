import { useState } from 'react';
import axios from 'axios';

const USER_ID = 'user-123';

const AMBIENCES = [
  { value: 'forest', label: '🌲 Forest' },
  { value: 'ocean', label: '🌊 Ocean' },
  { value: 'mountain', label: '⛰️ Mountain' },
];

export default function JournalForm({ onEntryAdded }) {
  const [text, setText] = useState('');
  const [ambience, setAmbience] = useState('forest');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim()) return setError('Please write something first.');
    setError('');
    setAnalyzing(true);
    try {
      const { data } = await axios.post('/api/journal/analyze', { text });
      setAnalysis(data);
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return setError('Please write something first.');
    setError('');
    setSaving(true);
    try {
      await axios.post('/api/journal', { userId: USER_ID, ambience, text });
      setText('');
      setAnalysis(null);
      onEntryAdded();
    } catch {
      setError('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2>New Entry</h2>

      <div className="ambience-row">
        {AMBIENCES.map((a) => (
          <button
            key={a.value}
            className={`ambience-btn ${ambience === a.value ? 'active' : ''}`}
            onClick={() => setAmbience(a.value)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <textarea
        placeholder="What thoughts emerge in this space?..."
        value={text}
        onChange={(e) => { setText(e.target.value); setAnalysis(null); }}
      />

      {analysis && (
        <div className="analysis-box">
          <div className="emotion">✨ {analysis.emotion}</div>
          <div className="summary">{analysis.summary}</div>
          <div className="tags">
            {analysis.keywords?.map((kw) => (
              <span key={kw} className="tag">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <div className="form-actions">
        <button
          className="btn btn-secondary"
          onClick={handleAnalyze}
          disabled={analyzing || !text.trim()}
        >
          {analyzing ? 'Analyzing...' : '🔍 Analyze with AI'}
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={saving || !text.trim()}
        >
          {saving ? 'Saving...' : '💾 Save Entry'}
        </button>
      </div>
    </div>
  );
}

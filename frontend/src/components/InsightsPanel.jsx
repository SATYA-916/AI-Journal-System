import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function InsightsPanel({ refreshTrigger }) {
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api.get('/journal/insights')
      .then(({ data }) => setInsights(data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load insights'));
  }, [refreshTrigger]);

  if (error) return <div className="error">{error}</div>;
  if (!insights) return null;

  return (
    <div className="card">
      <h2>Insights</h2>
      <div className="insights-grid">
        <div className="stat">
          <div className="value">{insights.totalEntries}</div>
          <div className="label">Total Entries</div>
        </div>
        <div className="stat">
          <div className="value" style={{ fontSize: '1.1rem' }}>{insights.topEmotion || '—'}</div>
          <div className="label">Top Emotion</div>
        </div>
        <div className="stat">
          <div className="value" style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>{insights.mostUsedAmbience || '—'}</div>
          <div className="label">Fav. Ambience</div>
        </div>
        <div className="stat">
          <div className="value">{insights.recentKeywords?.length || 0}</div>
          <div className="label">Keywords</div>
        </div>
      </div>

      {insights.recentKeywords?.length > 0 && (
        <>
          <h3 style={{ marginBottom: 10 }}>Recent Keywords</h3>
          <div className="tags">
            {insights.recentKeywords.map((kw) => (
              <span key={kw} className="tag">{kw}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

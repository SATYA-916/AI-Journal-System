import { useEffect, useState } from 'react';
import api from '../api/client.js';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function EntriesList({ refreshTrigger }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/journal')
      .then(({ data }) => setEntries(data))
      .catch((err) => setError(err.response?.data?.error || 'Unable to load entries'))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) return <div className="spinner">Loading entries...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Your Entries</h2>
      {entries.length === 0 ? (
        <div className="empty">No entries yet. Write your first one!</div>
      ) : (
        entries.map((entry) => (
          <div key={entry._id} className="entry">
            <div className="entry-header">
              <div className="entry-meta">
                <span className={`badge badge-${entry.ambience}`}>{entry.ambience}</span>
                {entry.emotion && <span className="badge badge-emotion">{entry.emotion}</span>}
              </div>
              <span className="date">{formatDate(entry.createdAt)}</span>
            </div>
            <div className="entry-text">{entry.text}</div>
            {entry.analysisStatus === 'pending' && <div className="entry-summary">AI analysis pending...</div>}
            {entry.summary && <div className="entry-summary">"{entry.summary}"</div>}
            {entry.keywords?.length > 0 && (
              <div className="tags">
                {entry.keywords.map((kw) => (
                  <span key={kw} className="tag">{kw}</span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

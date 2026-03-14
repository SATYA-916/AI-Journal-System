import { useMemo, useState } from 'react';
import JournalForm from './components/JournalForm.jsx';
import EntriesList from './components/EntriesList.jsx';
import InsightsPanel from './components/InsightsPanel.jsx';
import AuthPanel from './components/auth/AuthPanel.jsx';

export default function App() {
  const [refresh, setRefresh] = useState(0);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('journal_user');
    return raw ? JSON.parse(raw) : null;
  });

  const handleEntryAdded = () => setRefresh((r) => r + 1);

  const greeting = useMemo(() => user?.name || user?.email || 'Journaler', [user]);

  const logout = () => {
    localStorage.removeItem('journal_token');
    localStorage.removeItem('journal_user');
    setUser(null);
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Nature's Echo</h1>
        <p>A quiet space to reflect on your time in nature. Let AI reveal the currents of your thoughts.</p>
      </div>

      {!user ? (
        <AuthPanel onAuthenticated={setUser} />
      ) : (
        <>
          <div className="session-bar">
            <span>Welcome, {greeting}</span>
            <button className="btn btn-secondary" onClick={logout}>Logout</button>
          </div>
          <div className="layout">
            <div>
              <JournalForm onEntryAdded={handleEntryAdded} />
              <div style={{ marginTop: 28 }}>
                <EntriesList refreshTrigger={refresh} />
              </div>
            </div>
            <div>
              <InsightsPanel refreshTrigger={refresh} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

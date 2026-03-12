import { useState } from 'react';
import JournalForm from './components/JournalForm.jsx';
import EntriesList from './components/EntriesList.jsx';
import InsightsPanel from './components/InsightsPanel.jsx';

export default function App() {
  const [refresh, setRefresh] = useState(0);

  const handleEntryAdded = () => setRefresh((r) => r + 1);

  return (
    <div className="app">
      <div className="header">
        <h1>Nature's Echo</h1>
        <p>A quiet space to reflect on your time in nature. Let AI reveal the currents of your thoughts.</p>
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
    </div>
  );
}

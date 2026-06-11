import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { initialAppState } from '../data/initialState';
import { getUserData } from '../utils/storage';
import { formatSeconds } from '../utils/timer';

function HistoryPage() {
  const { currentUser } = useAuth();
  const [appState, setAppState] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      const data = await getUserData(currentUser.uid);
      setAppState(data || initialAppState);
    }
    fetchData();
  }, [currentUser]);

  if (!appState) {
    return (
      <main className="app-shell">
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner"></div>
        </div>
      </main>
    );
  }

  const { coins, user, history = [] } = appState;

  return (
    <main className="app-shell">
      <Header coins={coins} userLevel={user.title} userName={user.name} />
      <section className="page-content">
        <h1>Activity History</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Review your past focus sessions and progress.
        </p>

        {history.length === 0 ? (
          <div className="task-empty-state">
            <h2>No history yet.</h2>
            <p>Complete your first session to see it here.</p>
          </div>
        ) : (
          <div className="task-list task-list--scrollable">
            {history.map((record) => (
              <article key={record.id} className="task-card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: record.status === 'failed' ? 'var(--danger)' : 'inherit' }}>
                      {record.taskName} {record.isRegeneration ? '(Regeneration)' : ''}
                    </h3>
                    <p>
                      {new Date(record.date).toLocaleString()} · {record.status === 'failed' ? 'Failed' : formatSeconds(record.focusSeconds)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                    {record.status === 'failed' ? (
                      <span style={{ color: 'var(--danger)' }}>{record.rewards?.hp} HP</span>
                    ) : (
                      <>
                        <span style={{ color: 'var(--accent)' }}>+{record.rewards?.xp} XP</span>
                        <br />
                        <span style={{ color: 'var(--warning)' }}>+{record.rewards?.coins} Coins</span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <BottomNav />
    </main>
  );
}

export default HistoryPage;

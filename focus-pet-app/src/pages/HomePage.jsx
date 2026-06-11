import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import Header from '../components/Header';
import PetCard from '../components/PetCard';
import { getUserData } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { initialAppState } from '../data/initialState';

function HomePage() {
  const { currentUser } = useAuth();
  const [appState, setAppState] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [randomProTip, setRandomProTip] = useState('');

  const proTips = [
    "Stay hydrated! Drink a glass of water.",
    "A short stretch break will improve your circulation.",
    "Magical pets grow faster when you focus on one task at a time.",
    "Keep your phone away from your desk to avoid temptation.",
    "Deep focus for 60 minutes yields the best results and rewards."
  ];

  useEffect(() => {
    setRandomProTip(proTips[Math.floor(Math.random() * proTips.length)]);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      const data = await getUserData(currentUser.uid);
      setAppState(data || initialAppState);
    }
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedTaskId && appState?.tasks?.length) {
      setSelectedTaskId(appState.tasks[0].id);
    }
  }, [appState, selectedTaskId]);

  if (!appState) {
    return (
      <main className="app-shell">
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner"></div>
        </div>
      </main>
    );
  }

  const { coins, pet, tasks, user } = appState;
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || tasks[0];

  return (
    <main className="app-shell">
      <Header coins={coins} userLevel={user.title} userName={user.name} />
      <section className="page-content home-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Welcome!</h1>
        </div>
        
        <div className="home-tasks-container">
          <div className="section-heading">
            <h2>Tasks</h2>
            <Link to="/tasks">View all</Link>
          </div>

          <div className="task-list home-task-list">
            {tasks.slice(0, 2).map((task) => (
              <article
                className={`task-card ${selectedTaskId === task.id ? 'task-card--selected' : ''}`.trim()}
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <input
                  aria-label={`Select ${task.title}`}
                  checked={selectedTaskId === task.id}
                  onChange={() => setSelectedTaskId(task.id)}
                  type="checkbox"
                />
                <div>
                  <h3>{task.title}</h3>
                  <p>
                    {task.category} · {task.sessionLength} min session
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div style={{ backgroundColor: 'var(--bg-soft)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginTop: '24px', borderLeft: '4px solid var(--accent)' }}>
            <strong style={{ display: 'block', fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '4px' }}>ProTip</strong>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text)' }}>{randomProTip}</p>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
            {pet.hp <= 0 ? (
              <Link state={{ isRegeneration: true }} to="/session">
                <Button style={{ background: 'var(--danger)', color: '#fff' }}>Start Regeneration Session (30m)</Button>
              </Link>
            ) : (
              <Link state={{ task: selectedTask, taskId: selectedTask?.id }} to="/session">
                <Button>Start Session</Button>
              </Link>
            )}
          </div>
        </div>
        
        <div className="home-pet-card">
          <PetCard pet={pet} />
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

export default HomePage;

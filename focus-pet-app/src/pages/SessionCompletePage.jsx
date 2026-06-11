import { Link } from 'react-router-dom';
import { CircleDollarSign, Sparkles } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import Header from '../components/Header';
import { initialAppState } from '../data/initialState';
import { calculateSessionRewards } from '../utils/rewards';

const defaultFocusTime = '25:00';
const defaultRewards = calculateSessionRewards(25 * 60);

function SessionCompletePage({
  appState = initialAppState,
  focusTime = defaultFocusTime,
  onRestart,
  rewards = defaultRewards,
  isFailed = false,
}) {
  const { coins, user } = appState;
  const restartButton = (
    <Button className="session-complete__secondary" onClick={onRestart} variant="secondary">
      Start New Session
    </Button>
  );

  return (
    <main className="app-shell app-shell--session-state">
      <Header coins={coins} userLevel={user.title} userName={user.name} />

      <section className="session-state-card session-complete-card">
        <Sparkles className="session-complete__sparkle" aria-hidden="true" size={42} style={{ color: isFailed ? 'var(--danger)' : 'inherit' }} />
        <h1 style={{ color: isFailed ? 'var(--danger)' : 'inherit' }}>{isFailed ? 'Session Failed' : 'Session Complete'}</h1>
        <p>{isFailed ? 'You lost focus for too long.' : 'Your sanctuary has evolved through your discipline.'}</p>

        <div className="session-complete__stats">
          <div className="session-complete__time">
            <span>Focus Time</span>
            <strong>{focusTime}</strong>
          </div>

          <div className="session-complete__resilience">
            <div>
              <span>{isFailed ? 'Resilience Lost' : 'Resilience Gained'}</span>
              <strong style={{ color: isFailed ? 'var(--danger)' : 'inherit' }}>{isFailed ? '' : '+'}{rewards.hp} HP</strong>
            </div>
            <div className="session-complete__hp-track">
              <span style={{ width: `${Math.min(Math.abs(rewards.hp) * 4, 100)}%`, background: isFailed ? 'var(--danger)' : 'var(--accent)' }} />
            </div>
          </div>
        </div>

        <div className="session-complete__coins">
          <CircleDollarSign aria-hidden="true" size={24} />
          <span>Currency Accrued</span>
          <strong>{rewards.coins} Coins</strong>
        </div>

        <div className="session-complete__actions">
          <Link to="/home">
            <Button>Return to Focus Pet</Button>
          </Link>
          {onRestart ? restartButton : <Link to="/session">{restartButton}</Link>}
        </div>

      </section>

      <BottomNav />
    </main>
  );
}

export default SessionCompletePage;

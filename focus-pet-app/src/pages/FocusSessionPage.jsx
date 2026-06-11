import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Pause, Square, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { initialAppState } from '../data/initialState';
import { mockTasks } from '../data/mockTasks';
import { calculateSessionRewards } from '../utils/rewards';
import { getUserData, saveUserData } from '../utils/storage';
import { formatSeconds } from '../utils/timer';
import SessionCompletePage from './SessionCompletePage';
import SessionPausedPage from './SessionPausedPage';

const maxPetStat = 100;

function FocusSessionPage() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const zenAudioRef = useRef(null);
  const [appState, setAppState] = useState(null);
  const [sessionState, setSessionState] = useState('running');
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [completedSession, setCompletedSession] = useState(null);
  const [isZenSoundPlaying, setIsZenSoundPlaying] = useState(false);
  const isRegeneration = location.state?.isRegeneration || false;
  const selectedTaskFromRoute = location.state?.task;
  const selectedTaskId = location.state?.taskId || selectedTaskFromRoute?.id;
  const task = isRegeneration ? { title: 'Regeneration Session', sessionLength: 30, id: 'regen' } : (
    appState?.tasks?.find((item) => item.id === selectedTaskId) ||
    selectedTaskFromRoute ||
    appState?.tasks?.[0] ||
    mockTasks[0]
  );
  const sessionDurationSeconds = (task.sessionLength || 25) * 60;

  const completeSession = useCallback((focusSeconds) => {
    const finalFocusSeconds = Math.max(focusSeconds, 0);
    const rewards = isRegeneration
      ? { coins: 0, xp: 0, hp: 50 }
      : calculateSessionRewards(finalFocusSeconds);

    setCompletedSession({
      focusSeconds: finalFocusSeconds,
      rewards,
    });
    setSessionState('complete');

    if (!appState || !currentUser) {
      return;
    }

    const nextTasks = isRegeneration ? appState.tasks : appState.tasks.map((item) =>
      item.id === task.id ? { ...item, isDone: true } : item
    );

    const nextState = {
      ...appState,
      coins: appState.coins + rewards.coins,
      pet: {
        ...appState.pet,
        hp: Math.min((appState.pet?.hp || 0) + rewards.hp, maxPetStat),
        xp: (appState.pet?.xp || 0) + rewards.xp,
      },
      tasks: nextTasks,
    };

    setAppState(nextState);
    saveUserData(currentUser.uid, nextState);
  }, [appState, currentUser, task.id, isRegeneration]);

  const failSession = useCallback((penaltyHp = 15) => {
    const rewards = { coins: 0, xp: 0, hp: -penaltyHp };
    setCompletedSession({
      focusSeconds: 0,
      rewards,
    });
    setSessionState('failed');

    if (!appState || !currentUser) {
      return;
    }

    const nextState = {
      ...appState,
      pet: {
        ...appState.pet,
        hp: Math.max((appState.pet?.hp || 0) - penaltyHp, 0),
      },
    };

    setAppState(nextState);
    saveUserData(currentUser.uid, nextState);
  }, [appState, currentUser]);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      const data = await getUserData(currentUser.uid);
      setAppState(data || initialAppState);
    }

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const canStartTimer = Boolean(appState || selectedTaskFromRoute);

    if (canStartTimer && task?.id && remainingSeconds === null && completedSession === null) {
      setRemainingSeconds(sessionDurationSeconds);
    }
  }, [appState, completedSession, remainingSeconds, selectedTaskFromRoute, sessionDurationSeconds, task?.id]);

  useEffect(() => {
    if (!appState || sessionState !== 'running' || remainingSeconds === null) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setRemainingSeconds((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [appState, remainingSeconds, sessionState]);

  useEffect(() => {
    if (sessionState === 'running' && remainingSeconds === 0 && completedSession === null) {
      completeSession(sessionDurationSeconds);
    }
  }, [completeSession, completedSession, remainingSeconds, sessionDurationSeconds, sessionState]);

  useEffect(() => {
    let timeoutId;
    function handleVisibilityChange() {
      if (sessionState !== 'running') return;

      if (document.hidden) {
        timeoutId = setTimeout(() => {
          failSession(20);
        }, 60 * 1000);
      } else {
        if (timeoutId) clearTimeout(timeoutId);
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sessionState, failSession]);

  useEffect(() => () => {
    if (zenAudioRef.current) {
      zenAudioRef.current.pause();
      zenAudioRef.current.currentTime = 0;
    }
  }, []);

  function handleToggleZenSound() {
    const audio = zenAudioRef.current;

    if (!audio) {
      return;
    }

    if (isZenSoundPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsZenSoundPlaying(false);
      return;
    }

    audio.volume = 0.35;
    audio.play()
      .then(() => setIsZenSoundPlaying(true))
      .catch(() => setIsZenSoundPlaying(false));
  }

  function handleRestart() {
    setCompletedSession(null);
    setRemainingSeconds(sessionDurationSeconds);
    setSessionState('running');
  }

  if (!appState) {
    return (
      <main className="session-page">
        <div className="loading-spinner" />
      </main>
    );
  }

  const petType = appState.pet?.type || 'fox';
  const petName = appState.pet?.name || 'Finley';
  const petImage = `${process.env.PUBLIC_URL}/assets/pets/${petType}/sleeping.png`;
  const completedFocusSeconds = completedSession?.focusSeconds ?? sessionDurationSeconds;
  const focusTime = formatSeconds(completedFocusSeconds);
  const rewards = completedSession?.rewards ?? calculateSessionRewards(completedFocusSeconds);

  if (sessionState === 'paused') {
    return (
      <SessionPausedPage
        appState={appState}
        onResume={() => setSessionState('running')}
        petImage={petImage}
        petName={petName}
        task={task}
      />
    );
  }

  if (sessionState === 'complete' || sessionState === 'failed') {
    return (
      <SessionCompletePage
        appState={appState}
        focusTime={focusTime}
        onRestart={handleRestart}
        petName={petName}
        rewards={rewards}
        isFailed={sessionState === 'failed'}
      />
    );
  }

  return (
    <main className="session-page">
      <section className="session-card session-card--focus">
        <p className="session-task">
          <span>Task:</span>
          <strong>{task.title}</strong>
        </p>

        <div className="session-timer-shell">
          <strong className="session-timer">{formatSeconds(remainingSeconds ?? sessionDurationSeconds)}</strong>
        </div>

        <div className="session-pet-frame">
          <video
         autoPlay
        loop
    muted
    playsInline
    aria-hidden="true"
    <source src={`${process.env.PUBLIC_URL}/assets/pets/${petType}/sleep-video.mp4`} type="video/mp4" />
  </video>
</div>

        <h1>{petName} is resting while you work</h1>
        <p>Don't leave the app or {petName} will wake up</p>

        <div className="session-controls session-controls--icon">
          <button
            className="session-icon-action"
            onClick={() => failSession(20)}
            type="button"
          >
            <span>
              <Square aria-hidden="true" size={18} />
            </span>
            <strong>End Session</strong>
          </button>

          <button className="session-icon-action session-icon-action--primary" onClick={() => setSessionState('paused')} type="button">
            <span>
              <Pause aria-hidden="true" size={22} />
            </span>
            <strong>Take a Breath</strong>
          </button>

          <button
            aria-pressed={isZenSoundPlaying}
            className={`session-icon-action ${isZenSoundPlaying ? 'session-icon-action--active' : ''}`.trim()}
            onClick={handleToggleZenSound}
            type="button"
          >
            <span>
              <Volume2 aria-hidden="true" size={18} />
            </span>
            <strong>{isZenSoundPlaying ? 'Stop Sounds' : 'Zen Sounds'}</strong>
          </button>
        </div>

        <audio ref={zenAudioRef} loop preload="auto">
          <source src={`${process.env.PUBLIC_URL}/assets/sounds/relax.mp3`} type="audio/mpeg" />
        </audio>
      </section>
    </main>
  );
}

export default FocusSessionPage;

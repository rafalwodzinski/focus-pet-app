import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import Header from '../components/Header';
import PetCard from '../components/PetCard';
import { getUserData, saveUserData } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { initialAppState } from '../data/initialState';

const filters = ['All', 'Tasks', 'Projects'];

function TasksPage() {
  const { currentUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [appState, setAppState] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const [expandedProjects, setExpandedProjects] = useState([]);

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

  const { coins, pet, user } = appState;
  const tasks = appState.tasks || [];

  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === 'All') return true;
    return task.type === activeFilter.toLowerCase();
  });
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || tasks[0];

  function toggleProject(id) {
    setExpandedProjects((prev) => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  function persistTasks(nextTasks) {
    const nextState = {
      ...appState,
      tasks: nextTasks,
    };

    setAppState(nextState);

    if (currentUser) {
      saveUserData(currentUser.uid, nextState);
    }
  }

  function handleToggleTaskDone(taskId, event) {
    event.stopPropagation();
    const nextTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, isDone: !task.isDone } : task
    );

    persistTasks(nextTasks);
  }

  function handleDeleteTask(taskId, event) {
    event.stopPropagation();

    if (!window.confirm('Delete this task?')) {
      return;
    }

    const nextTasks = tasks.filter((task) => task.id !== taskId);
    const nextSelectedTaskId = selectedTaskId === taskId ? nextTasks[0]?.id || '' : selectedTaskId;

    persistTasks(nextTasks);
    setSelectedTaskId(nextSelectedTaskId);
  }

  const renderTask = (task, isProject = false) => {
    const isExpanded = expandedProjects.includes(task.id);
    const subtasks = tasks.filter(t => t.projectId === task.id);
    
    return (
      <div key={task.id}>
        <article
          className={`task-card ${selectedTaskId === task.id ? 'task-card--selected' : ''} ${task.isDone ? 'task-card--done' : ''}`.trim()}
          onClick={() => {
            setSelectedTaskId(task.id);
            if (isProject) toggleProject(task.id);
          }}
        >
          <input
            aria-label={`Complete ${task.title}`}
            checked={task.isDone}
            onChange={(event) => handleToggleTaskDone(task.id, event)}
            onClick={(event) => event.stopPropagation()}
            type="checkbox"
          />
          <div className="task-card__body">
            <h3>
              {task.title}
              {isProject && <span className="project-expand-icon">{isExpanded ? '▼' : '▶'}</span>}
            </h3>
            <p>
              {task.category} · {task.sessionLength} min session
            </p>
          </div>
          <div className="task-card__actions">
            <Link
              className="task-card__action"
              onClick={(event) => event.stopPropagation()}
              to={`/tasks/new?edit=${task.id}`}
            >
              Edit
            </Link>
            <button
              className="task-card__action task-card__action--danger"
              onClick={(event) => handleDeleteTask(task.id, event)}
              type="button"
            >
              Delete
            </button>
          </div>
        </article>
        
        {isProject && isExpanded && subtasks.length > 0 && (
          <div className="subtask-list">
            {subtasks.map(sub => renderTask(sub, false))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (activeFilter === 'Projects') {
      const projects = tasks.filter(t => t.type === 'projects');
      return projects.length ? projects.map(p => renderTask(p, true)) : null;
    }
    
    // For 'All' and 'Tasks', we render top-level tasks.
    // But we avoid rendering subtasks directly flat if we don't want them detached.
    // Let's just render all visible tasks that don't have a projectId, plus projects if 'All'.
    const topLevelTasks = visibleTasks.filter(t => !t.projectId);
    return topLevelTasks.length ? topLevelTasks.map(t => renderTask(t, t.type === 'projects')) : null;
  };

  const renderedContent = renderContent();

  return (
    <main className="app-shell">
      <Header coins={coins} userLevel={user.title} userName={user.name} />
      <section className="page-content page-content--two-columns tasks-layout">
        <div className="tasks-main">
          <h1>Tasks</h1>
          <div className="segmented-control">
            {filters.map((filter) => (
              <button
                className={activeFilter === filter ? 'is-active' : ''}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="task-list task-list--scrollable">
            {renderedContent ? renderedContent : (
              <div className="task-empty-state">
                <h2>No tasks here yet.</h2>
                <p>Add a task or project to prepare your next focus session.</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
            <Link to="/tasks/new">
              <Button>+ Add Task</Button>
            </Link>
            <Link state={{ task: selectedTask, taskId: selectedTask?.id }} to="/session">
              <Button>Start Session</Button>
            </Link>
          </div>
        </div>

        <aside className="tasks-pet-panel">
          <PetCard compact pet={pet} />
        </aside>
      </section>

      <BottomNav />
    </main>
  );
}

export default TasksPage;

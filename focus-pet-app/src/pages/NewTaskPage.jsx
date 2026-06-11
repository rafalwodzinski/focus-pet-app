import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import Header from '../components/Header';
import Input from '../components/Input';
import PetCard from '../components/PetCard';
import { useAuth } from '../context/AuthContext';
import { initialAppState } from '../data/initialState';
import { getUserData, saveUserData } from '../utils/storage';

const taskTypes = [
  { label: 'Task', value: 'tasks' },
  { label: 'Project', value: 'projects' },
];

const categories = ['Deep Work', 'Routine', 'Project', 'Study'];
const priorities = [
  { label: 'Low priority', value: 'low' },
  { label: 'Medium priority', value: 'medium' },
  { label: 'High priority', value: 'high' },
];
const sessionLengths = [5, 15, 25, 45, 60, 90];

const emptyTaskForm = {
  title: '',
  type: 'tasks',
  category: 'Deep Work',
  priority: 'medium',
  sessionLength: '25',
  deadline: '',
};

function toDatetimeLocal(value) {
  return value ? value.slice(0, 16) : '';
}

const NewTaskPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editTaskId = searchParams.get('edit');
  const isEditingTask = Boolean(editTaskId);
  const [appState, setAppState] = useState(null);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      const data = await getUserData(currentUser.uid);
      setAppState(data || initialAppState);
    }

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (!appState) return;

    if (!editTaskId) {
      setTaskForm(emptyTaskForm);
      setFormError('');
      return;
    }

    const taskToEdit = (appState.tasks || []).find((task) => task.id === editTaskId);

    if (!taskToEdit) {
      setFormError('Task not found.');
      return;
    }

    setTaskForm({
      title: taskToEdit.title || '',
      type: taskToEdit.type || 'tasks',
      category: taskToEdit.category || 'Deep Work',
      priority: taskToEdit.priority || 'medium',
      sessionLength: String(taskToEdit.sessionLength || 25),
      deadline: toDatetimeLocal(taskToEdit.deadline),
    });
    setFormError('');
  }, [appState, editTaskId]);

  function handleFormChange(event) {
    const { name, value } = event.target;

    setTaskForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === 'type' ? { category: value === 'projects' ? 'Project' : 'Deep Work' } : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!taskForm.title.trim()) {
      setFormError('Task name is required.');
      return;
    }

    if (!appState || !currentUser) {
      setFormError('User data is still loading.');
      return;
    }

    const currentTasks = appState.tasks || [];
    const taskToEdit = editTaskId
      ? currentTasks.find((task) => task.id === editTaskId)
      : null;

    if (editTaskId && !taskToEdit) {
      setFormError('Task not found.');
      return;
    }

    const taskId = taskToEdit?.id || `${taskForm.type}-${Date.now()}`;
    const savedTask = {
      ...taskToEdit,
      id: taskId,
      title: taskForm.title.trim(),
      type: taskForm.type,
      category: taskForm.category,
      priority: taskForm.priority,
      sessionLength: Number(taskForm.sessionLength) || 25,
      deadline: taskForm.deadline,
      isDone: taskToEdit?.isDone || false,
    };

    const nextTasks = taskToEdit
      ? currentTasks.map((task) => (task.id === taskToEdit.id ? savedTask : task))
      : [savedTask, ...currentTasks];
    const nextState = {
      ...appState,
      tasks: nextTasks,
    };

    setIsSaving(true);
    setFormError('');

    const isSaved = await saveUserData(currentUser.uid, nextState);

    setIsSaving(false);

    if (!isSaved) {
      setFormError('Could not save the task. Try again.');
      return;
    }

    navigate('/tasks');
  }

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

  return (
    <main className="app-shell">
      <Header coins={coins} userLevel={user.title} userName={user.name} />

      <section className="page-content task-form-page">
        <Link className="task-form-back" to="/tasks">
          Back to tasks
        </Link>

        <div className="task-form-shell">
          <form className="task-form-card" onSubmit={handleSubmit}>
            <p className="eyebrow">{isEditingTask ? 'Edit focus item' : 'New focus item'}</p>
            <h1>{isEditingTask ? 'Update your task' : 'Plan your next focus session'}</h1>
            <p className="task-form-intro">
              Add the task details, choose the focus length and your session will use this time automatically.
            </p>

            {formError ? <div className="task-form-error">{formError}</div> : null}

            <div className="task-form-grid">
              <Input
                error={!taskForm.title.trim() && formError === 'Task name is required.' ? formError : ''}
                id="taskTitle"
                label="Task name"
                name="title"
                onChange={handleFormChange}
                placeholder="e.g. Review lecture notes"
                required
                value={taskForm.title}
              />

              <label className="field" htmlFor="taskType">
                <span className="field__label">Type</span>
                <select
                  className="field__input field__select"
                  id="taskType"
                  name="type"
                  onChange={handleFormChange}
                  value={taskForm.type}
                >
                  {taskTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field" htmlFor="taskCategory">
                <span className="field__label">Category</span>
                <select
                  className="field__input field__select"
                  id="taskCategory"
                  name="category"
                  onChange={handleFormChange}
                  value={taskForm.category}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field" htmlFor="taskPriority">
                <span className="field__label">Priority</span>
                <select
                  className="field__input field__select"
                  id="taskPriority"
                  name="priority"
                  onChange={handleFormChange}
                  value={taskForm.priority}
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field" htmlFor="taskSessionLength">
                <span className="field__label">Focus time</span>
                <select
                  className="field__input field__select"
                  id="taskSessionLength"
                  name="sessionLength"
                  onChange={handleFormChange}
                  value={taskForm.sessionLength}
                >
                  {sessionLengths.map((length) => (
                    <option key={length} value={length}>
                      {length} min session
                    </option>
                  ))}
                </select>
              </label>

              <Input
                id="taskDeadline"
                label="Deadline"
                name="deadline"
                onChange={handleFormChange}
                type="datetime-local"
                value={taskForm.deadline}
              />
            </div>

            <div className="task-form-actions">
              <Button disabled={isSaving} type="submit">
                {isSaving ? 'Saving...' : isEditingTask ? 'Save changes' : 'Add task'}
              </Button>
              <Link className="button button--secondary" to="/tasks">
                Cancel
              </Link>
            </div>
          </form>

          <aside className="task-form-preview">
            <p className="eyebrow">Session preview</p>
            <h2>{taskForm.title || 'New focus task'}</h2>
            <p>
              {taskForm.category} - {taskForm.sessionLength} min session
            </p>
            <PetCard compact pet={pet} />
          </aside>
        </div>
      </section>

      <BottomNav />
    </main>
  );
};

export default NewTaskPage;

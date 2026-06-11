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

const categories = ['Deep Work', 'Routine', 'Project', 'Study'];
const priorities = [
  { label: 'Low priority', value: 'low' },
  { label: 'Medium priority', value: 'medium' },
  { label: 'High priority', value: 'high' },
];
const sessionLengths = [5, 15, 25, 45, 60, 90];

const emptyProjectForm = {
  title: '',
  category: 'Project',
  priority: 'high',
  sessionLength: '60',
  deadline: '',
  subtasks: [{ id: Date.now().toString(), title: '', deadline: '' }],
};

function toDatetimeLocal(value) {
  return value ? value.slice(0, 16) : '';
}

const NewProjectPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editProjectId = searchParams.get('edit');
  const isEditingProject = Boolean(editProjectId);
  const [appState, setAppState] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
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

    if (!editProjectId) {
      setProjectForm(emptyProjectForm);
      setFormError('');
      return;
    }

    const tasks = appState.tasks || [];
    const projectToEdit = tasks.find((task) => task.id === editProjectId && task.type === 'projects');

    if (!projectToEdit) {
      setFormError('Project not found.');
      return;
    }

    const subtasks = tasks.filter(t => t.projectId === editProjectId).map(t => ({
      id: t.id,
      title: t.title,
      deadline: t.deadline || '',
    }));

    setProjectForm({
      title: projectToEdit.title || '',
      category: projectToEdit.category || 'Project',
      priority: projectToEdit.priority || 'high',
      sessionLength: String(projectToEdit.sessionLength || 60),
      deadline: toDatetimeLocal(projectToEdit.deadline),
      subtasks: subtasks.length > 0 ? subtasks : emptyProjectForm.subtasks,
    });
    setFormError('');
  }, [appState, editProjectId]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setProjectForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSubtaskChange(id, field, value) {
    setProjectForm(current => ({
      ...current,
      subtasks: current.subtasks.map(st => 
        st.id === id ? { ...st, [field]: value } : st
      )
    }));
  }

  function addSubtask() {
    setProjectForm(current => ({
      ...current,
      subtasks: [...current.subtasks, { id: Date.now().toString(), title: '', deadline: '' }]
    }));
  }

  function removeSubtask(id) {
    setProjectForm(current => ({
      ...current,
      subtasks: current.subtasks.filter(st => st.id !== id)
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!projectForm.title.trim()) {
      setFormError('Project name is required.');
      return;
    }

    if (projectForm.subtasks.some(st => !st.title.trim())) {
      setFormError('All subtasks must have a title.');
      return;
    }

    if (!appState || !currentUser) {
      setFormError('User data is still loading.');
      return;
    }

    const currentTasks = appState.tasks || [];
    const projectId = editProjectId || `projects-${Date.now()}`;
    
    const projectTask = {
      id: projectId,
      title: projectForm.title.trim(),
      type: 'projects',
      category: projectForm.category,
      priority: projectForm.priority,
      sessionLength: Number(projectForm.sessionLength) || 60,
      deadline: projectForm.deadline,
      isDone: false, // Could compute from subtasks later
    };

    const newSubtasks = projectForm.subtasks.map((st, index) => ({
      id: st.id.startsWith('tasks-') ? st.id : `tasks-${Date.now()}-${index}`,
      projectId: projectId,
      title: st.title.trim(),
      type: 'tasks',
      category: projectForm.category,
      priority: projectForm.priority,
      sessionLength: Number(projectForm.sessionLength) || 60,
      deadline: st.deadline,
      isDone: false,
    }));

    // Remove old subtasks
    let nextTasks = currentTasks.filter(t => t.id !== projectId && t.projectId !== projectId);
    
    // Add new project and subtasks
    nextTasks = [projectTask, ...newSubtasks, ...nextTasks];

    const nextState = {
      ...appState,
      tasks: nextTasks,
    };

    setIsSaving(true);
    setFormError('');

    const isSaved = await saveUserData(currentUser.uid, nextState);
    setIsSaving(false);

    if (!isSaved) {
      setFormError('Could not save the project. Try again.');
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
            <p className="eyebrow">{isEditingProject ? 'Edit Project' : 'New Project'}</p>
            <h1>{isEditingProject ? 'Update your project' : 'Plan your next big project'}</h1>
            <p className="task-form-intro">
              Break down your work into manageable subtasks.
            </p>

            {formError ? <div className="task-form-error">{formError}</div> : null}

            <div className="task-form-grid">
              <Input
                error={!projectForm.title.trim() && formError === 'Project name is required.' ? formError : ''}
                id="projectTitle"
                label="Project name"
                name="title"
                onChange={handleFormChange}
                placeholder="e.g. Final Thesis"
                required
                value={projectForm.title}
              />

              <label className="field" htmlFor="projectCategory">
                <span className="field__label">Category</span>
                <select
                  className="field__input field__select"
                  id="projectCategory"
                  name="category"
                  onChange={handleFormChange}
                  value={projectForm.category}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field" htmlFor="projectPriority">
                <span className="field__label">Priority</span>
                <select
                  className="field__input field__select"
                  id="projectPriority"
                  name="priority"
                  onChange={handleFormChange}
                  value={projectForm.priority}
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field" htmlFor="projectSessionLength">
                <span className="field__label">Focus time per subtask</span>
                <select
                  className="field__input field__select"
                  id="projectSessionLength"
                  name="sessionLength"
                  onChange={handleFormChange}
                  value={projectForm.sessionLength}
                >
                  {sessionLengths.map((length) => (
                    <option key={length} value={length}>
                      {length} min session
                    </option>
                  ))}
                </select>
              </label>

              <Input
                id="projectDeadline"
                label="Main Deadline"
                name="deadline"
                onChange={handleFormChange}
                type="datetime-local"
                value={projectForm.deadline}
              />
            </div>

            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h3 style={{ marginBottom: '16px' }}>Subtasks</h3>
              {projectForm.subtasks.map((st, idx) => (
                <div key={st.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', marginBottom: '16px', alignItems: 'end' }}>
                  <Input 
                    label={`Subtask ${idx + 1}`} 
                    value={st.title} 
                    onChange={(e) => handleSubtaskChange(st.id, 'title', e.target.value)} 
                    placeholder="e.g. Research chapter 1"
                  />
                  <Input 
                    type="datetime-local" 
                    label="Deadline (optional)" 
                    value={st.deadline} 
                    onChange={(e) => handleSubtaskChange(st.id, 'deadline', e.target.value)} 
                  />
                  <button 
                    type="button" 
                    className="button button--secondary" 
                    style={{ minWidth: '48px', padding: '0', color: 'var(--danger)' }}
                    onClick={() => removeSubtask(st.id)}
                    disabled={projectForm.subtasks.length === 1}
                  >
                    X
                  </button>
                </div>
              ))}
              <Button type="button" className="button button--secondary" onClick={addSubtask} style={{ marginTop: '8px' }}>
                + Add Subtask
              </Button>
            </div>

            <div className="task-form-actions" style={{ marginTop: '32px' }}>
              <Button disabled={isSaving} type="submit">
                {isSaving ? 'Saving...' : isEditingProject ? 'Save changes' : 'Add project'}
              </Button>
              <Link className="button button--secondary" to="/tasks">
                Cancel
              </Link>
            </div>
          </form>

          <aside className="task-form-preview">
            <p className="eyebrow">Project preview</p>
            <h2>{projectForm.title || 'New focus project'}</h2>
            <p>
              {projectForm.category} - {projectForm.subtasks.length} subtasks
            </p>
            <PetCard compact pet={pet} />
          </aside>
        </div>
      </section>

      <BottomNav />
    </main>
  );
};

export default NewProjectPage;

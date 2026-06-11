import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { initializeGoogleAnalytics, initializeHotjar } from './utils/analytics';

// Importy komponentów stron
import FocusSessionPage from './pages/FocusSessionPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import OnboardingPage from './pages/OnboardingPage';
import RegisterPage from './pages/RegisterPage';
import ShopPage from './pages/ShopPage';
import TasksPage from './pages/TasksPage';
import NotFoundPage from './pages/NotFoundPage';
import NewTaskPage from './pages/NewTaskPage';
import NewProjectPage from './pages/NewProjectPage';
import FilterTasksPage from './pages/FilterTasksPage';
import FilterProjectsPage from './pages/FilterProjectsPage';
import ShopFoodPage from './pages/ShopFoodPage';
import ShopAccessoriesPage from './pages/ShopAccessoriesPage';
import SessionPausedPage from './pages/SessionPausedPage';
import SessionCompletePage from './pages/SessionCompletePage';
import HistoryPage from './pages/HistoryPage';

// Importy związane z autoryzacją
import { AuthProvider } from './context/AuthContext';
import AnalyticsListener from './components/AnalyticsListener';
import PrivateRoute from './components/PrivateRoute';

function App() {
  useEffect(() => {
    initializeHotjar();
    initializeGoogleAnalytics();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AnalyticsListener />
        <Routes>
          {/* Trasa główna przekierowująca do logowania */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Trasy publiczne */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Trasy chronione */}
          <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/tasks" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
          <Route path="/tasks/new" element={<PrivateRoute><NewTaskPage /></PrivateRoute>} />
          <Route path="/projects/new" element={<PrivateRoute><NewProjectPage /></PrivateRoute>} />
          <Route path="/tasks/filter/tasks" element={<PrivateRoute><FilterTasksPage /></PrivateRoute>} />
          <Route path="/tasks/filter/projects" element={<PrivateRoute><FilterProjectsPage /></PrivateRoute>} />
          <Route path="/shop" element={<PrivateRoute><ShopPage /></PrivateRoute>} />
          <Route path="/shop/food" element={<PrivateRoute><ShopFoodPage /></PrivateRoute>} />
          <Route path="/shop/accessories" element={<PrivateRoute><ShopAccessoriesPage /></PrivateRoute>} />
          <Route path="/session" element={<PrivateRoute><FocusSessionPage /></PrivateRoute>} />
          <Route path="/session/paused" element={<PrivateRoute><SessionPausedPage /></PrivateRoute>} />
          <Route path="/session-complete" element={<PrivateRoute><SessionCompletePage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />
          <Route path="/logout" element={<PrivateRoute><LogoutPage /></PrivateRoute>} />

          {/* Trasa nieznaleziona (404) */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import DashboardView from './Pages/DashboardView';
import ProjectsView from './Pages/ProjectsView';
import AdminView from './Pages/AdminView';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  
  // Task State (Dynamically fetched from backend)
  const [tasks, setTasks] = useState([]);

  // Fetch backend status and tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/health', { timeout: 3000 });
        if (response.data && response.data.status === 'ok') {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (err) {
        setServerStatus('offline');
      }
    };

    checkServer();
    fetchTasks(); // Fetch tasks on mount
    // Poll server health every 10 seconds
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handlers for Tasks
  const handleAddTask = async (taskData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/projects', taskData);
      setTasks((prev) => [...prev, response.data]);
    } catch (err) {
      console.error('Failed to add project', err);
    }
  };

  const handleToggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    try {
      await axios.put(`http://localhost:5000/api/projects/${id}/toggle`, { completed: !task.completed });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    } catch (err) {
      console.error('Failed to toggle project', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const handleUpdateSubTaskAttachment = async (projectId, subTaskId, file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);
      const res = await axios.post(`http://localhost:5000/api/subtasks/${subTaskId}/attachment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTasks((prev) => prev.map((t) => {
        if (t.id === projectId && t.subTasks) {
          const updatedSubTasks = t.subTasks.map(sub => 
            sub.id === subTaskId ? { ...sub, attachment_filename: res.data.filename, attachment_original_name: res.data.originalname } : sub
          );
          return { ...t, subTasks: updatedSubTasks };
        }
        return t;
      }));
    } catch (err) {
      console.error('Failed to upload subtask attachment', err);
    }
  };

  const handleUpdateActiveStatus = async (id, newActiveStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/projects/${id}/active`, { activeStatus: newActiveStatus });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, activeStatus: newActiveStatus } : t)));
    } catch (err) {
      console.error('Failed to update active status', err);
    }
  };

  const handleAddBulkTasks = async (projectId, newTasksArray) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/projects/${projectId}/subtasks/bulk`, { subTasks: newTasksArray });
      setTasks((prev) => prev.map((t) => {
        if (t.id === projectId) {
          return { ...t, subTasks: response.data };
        }
        return t;
      }));
    } catch (err) {
      console.error('Failed to add bulk tasks', err);
    }
  };

  const handleUpdateSubTaskStatus = async (projectId, subTaskId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/subtasks/${subTaskId}/status`, { status: newStatus });
      setTasks((prev) => prev.map((t) => {
        if (t.id === projectId && t.subTasks) {
          const updatedSubTasks = t.subTasks.map(sub => 
            sub.id === subTaskId ? { ...sub, status: newStatus } : sub
          );
          return { ...t, subTasks: updatedSubTasks };
        }
        return t;
      }));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleReorderSubTask = async (projectId, draggedId, targetId) => {
    if (draggedId === targetId) return;
    
    setTasks((prev) => {
      const newTasks = [...prev];
      const projectIndex = newTasks.findIndex(t => t.id === projectId);
      if (projectIndex === -1 || !newTasks[projectIndex].subTasks) return prev;
      
      const subTasks = [...newTasks[projectIndex].subTasks];
      const draggedIndex = subTasks.findIndex(sub => sub.id === draggedId);
      const targetIndex = subTasks.findIndex(sub => sub.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      const [draggedItem] = subTasks.splice(draggedIndex, 1);
      subTasks.splice(targetIndex, 0, draggedItem);
      
      newTasks[projectIndex].subTasks = subTasks;
      
      // Fire and forget to backend
      axios.put(`http://localhost:5000/api/projects/${projectId}/subtasks/reorder`, { subTasks }).catch(err => {
         console.error('Failed to reorder subtasks', err);
      });
      
      return newTasks;
    });
  };

  const handleEditSubTask = async (projectId, subTaskId, newTitle) => {
    try {
      await axios.put(`http://localhost:5000/api/subtasks/${subTaskId}`, { title: newTitle });
      setTasks((prev) => prev.map((t) => {
        if (t.id === projectId && t.subTasks) {
          const updatedSubTasks = t.subTasks.map(sub => 
            sub.id === subTaskId ? { ...sub, title: newTitle } : sub
          );
          return { ...t, subTasks: updatedSubTasks };
        }
        return t;
      }));
    } catch (err) {
      console.error('Failed to edit subtask', err);
    }
  };

  const handleUpdateSubTaskRemark = async (projectId, subTaskId, remark) => {
    try {
      await axios.put(`http://localhost:5000/api/subtasks/${subTaskId}/remark`, { remark: remark });
      setTasks((prev) => prev.map((t) => {
        if (t.id === projectId && t.subTasks) {
          const updatedSubTasks = t.subTasks.map(sub => 
            sub.id === subTaskId ? { ...sub, remark: remark } : sub
          );
          return { ...t, subTasks: updatedSubTasks };
        }
        return t;
      }));
    } catch (err) {
      console.error('Failed to update subtask remark', err);
    }
  };

  // Login Click (Triggers login view transition)
  const handleLoginClick = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false);
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('login');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Basic mock authentication
    if (loginForm.username && loginForm.password) {
      setIsLoggedIn(true);
      setCurrentTab('dashboard');
      setLoginForm({ username: '', password: '' });
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isLoggedIn={isLoggedIn}
        onLoginClick={handleLoginClick}
      />

      {/* Main Content Area (Body) */}
      <main className="app-body">
        {currentTab === 'dashboard' && (
          <DashboardView
            tasks={tasks}
            totalTasks={tasks.length}
            completedTasks={tasks.filter((t) => t.completed).length}
          />
        )}
        {currentTab === 'tasks' && (
          <ProjectsView
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onUpdateActiveStatus={handleUpdateActiveStatus}
            onAddBulkTasks={handleAddBulkTasks}
            onUpdateSubTaskStatus={handleUpdateSubTaskStatus}
            onReorderSubTask={handleReorderSubTask}
            onEditSubTask={handleEditSubTask}
            onUpdateSubTaskRemark={handleUpdateSubTaskRemark}
            onUpdateSubTaskAttachment={handleUpdateSubTaskAttachment}
          />
        )}
        {currentTab === 'admin' && (
          <AdminView serverStatus={serverStatus} />
        )}
        {currentTab === 'login' && (
          <div className="login-view">
            <span className="login-icon-large">🔑</span>
            <h2>Sign In</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Sign in to manage team and server settings.
            </p>
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="admin"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                Log In
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer serverStatus={serverStatus} />
    </div>
  );
}

export default App;

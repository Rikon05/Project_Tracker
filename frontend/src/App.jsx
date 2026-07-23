import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './services/api';
import Header from './components/Header';
import Footer from './components/Footer';
import DashboardView from './Pages/DashboardView';
import ProjectsView from './Pages/ProjectsView';
import AdminView from './Pages/AdminView';
import LoginView from './Pages/LoginView';

function App() {
  const [currentTab, setCurrentTab] = useState(() => sessionStorage.getItem('currentTab') || 'login');
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('isLoggedIn') === 'true');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [serverStatus, setServerStatus] = useState('checking');
  const [loginMessage, setLoginMessage] = useState('');

  // Persist state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('currentTab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    sessionStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Update URL to match current tab
  useEffect(() => {
    window.history.pushState(null, '', `/${currentTab}`);
  }, [currentTab]);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn && currentTab !== 'login') {
      setCurrentTab('login');
    }
  }, [isLoggedIn, currentTab]);

  const handleLogout = (message = '') => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentTab('login');
    setLoginMessage(message);
  };

  // Handle tab/browser close detection (allow refreshes but expire on close)
  useEffect(() => {
    const lastUnload = localStorage.getItem('lastUnloadTime');
    if (lastUnload) {
      const timeSinceUnload = Date.now() - parseInt(lastUnload, 10);
      // If more than 8 seconds, expire session
      if (timeSinceUnload > 8000) {
        handleLogout();
      }
    }

    const handleBeforeUnload = () => {
      localStorage.setItem('lastUnloadTime', Date.now().toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Inactivity timeout (15 mins)
  useEffect(() => {
    if (!isLoggedIn) return;

    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 mins

    const resetTimer = () => {
      sessionStorage.setItem('lastActivity', Date.now().toString());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const addListeners = () => events.forEach(event => window.addEventListener(event, resetTimer));
    const removeListeners = () => events.forEach(event => window.removeEventListener(event, resetTimer));

    addListeners();
    resetTimer();

    const interval = setInterval(() => {
      const lastActivity = sessionStorage.getItem('lastActivity');
      if (lastActivity) {
        const timePassed = Date.now() - parseInt(lastActivity, 10);
        if (timePassed >= INACTIVITY_LIMIT) {
          handleLogout('Session expired due to 15 minutes of inactivity.');
        }
      }
    }, 10000); // Check every 10 seconds

    return () => {
      removeListeners();
      clearInterval(interval);
    };
  }, [isLoggedIn]);

  // Connection loss / restore handler
  useEffect(() => {
    if (!isLoggedIn) return;

    // Track offline status since mount
    let isCurrentlyOffline = !navigator.onLine;

    const handleOffline = () => {
      isCurrentlyOffline = true;
      handleLogout('Session expired due to internet connection changes.');
    };

    const handleOnline = () => {
      if (isCurrentlyOffline) {
        handleLogout('Session expired due to internet connection changes.');
      }
      isCurrentlyOffline = false;
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [isLoggedIn]);
  
  // Task State (Dynamically fetched from backend)
  const [tasks, setTasks] = useState([]);

  // Fetch backend status and tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/projects`);
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 3000 });
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
      const response = await axios.post(`${API_BASE_URL}/api/projects`, taskData);
      setTasks((prev) => [...prev, response.data]);
    } catch (err) {
      console.error('Failed to add project', err);
    }
  };

  const handleToggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    try {
      await axios.put(`${API_BASE_URL}/api/projects/${id}/toggle`, { completed: !task.completed });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    } catch (err) {
      console.error('Failed to toggle project', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/projects/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const handleEditProject = async (id, updatedData) => {
    try {
      await axios.put(`${API_BASE_URL}/api/projects/${id}`, updatedData);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t)));
    } catch (err) {
      console.error('Failed to edit project', err);
    }
  };

    const handleUpdateSubTaskAttachment = async (projectId, subTaskId, file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);
      if (currentUser?.name) formData.append('attached_by', currentUser.name);
      const res = await axios.post(`${API_BASE_URL}/api/subtasks/${subTaskId}/attachment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTasks((prev) => prev.map((t) => {
        if (t.id === projectId && t.subTasks) {
          const updatedSubTasks = t.subTasks.map(sub => 
            sub.id === subTaskId ? { ...sub, attachment_filename: res.data.filename, attachment_original_name: res.data.originalname, attached_by: currentUser?.name, attached_at: new Date().toISOString() } : sub
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
      await axios.put(`${API_BASE_URL}/api/projects/${id}/active`, { activeStatus: newActiveStatus });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, activeStatus: newActiveStatus } : t)));
    } catch (err) {
      console.error('Failed to update active status', err);
    }
  };

  const handleAddBulkTasks = async (projectId, newTasksArray) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/projects/${projectId}/subtasks/bulk`, { subTasks: newTasksArray });
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
      const updatedBy = currentUser?.name || '';
      await axios.put(`${API_BASE_URL}/api/subtasks/${subTaskId}/status`, { status: newStatus, updated_by: updatedBy });
      setTasks((prev) => prev.map((t) => {
        if (t.id === projectId && t.subTasks) {
          const updatedSubTasks = t.subTasks.map(sub => 
            sub.id === subTaskId ? { ...sub, status: newStatus, updated_by: updatedBy, updated_at: new Date().toISOString() } : sub
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
      axios.put(`${API_BASE_URL}/api/projects/${projectId}/subtasks/reorder`, { subTasks }).catch(err => {
         console.error('Failed to reorder subtasks', err);
      });
      
      return newTasks;
    });
  };

  const handleEditSubTask = async (projectId, subTaskId, newTitle) => {
    try {
      await axios.put(`${API_BASE_URL}/api/subtasks/${subTaskId}`, { title: newTitle });
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
      const commentedBy = currentUser?.name || '';
      const res = await axios.put(`${API_BASE_URL}/api/subtasks/${subTaskId}/remark`, { remark: remark, commented_by: commentedBy });
      setTasks((prev) => prev.map((t) => {
        if (t.id === projectId && t.subTasks) {
          const updatedSubTasks = t.subTasks.map(sub => 
            sub.id === subTaskId ? { ...sub, remark: remark, commented_by: commentedBy, commented_at: new Date().toISOString(), comments: res.data.comments } : sub
          );
          return { ...t, subTasks: updatedSubTasks };
        }
        return t;
      }));
    } catch (err) {
      console.error('Failed to update subtask remark', err);
    }
  };

  const handleLoginClick = () => {
    if (isLoggedIn) {
      handleLogout();
    } else {
      setCurrentTab('login');
    }
  };

  const handleLoginSubmit = async (username, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, { username, password });
      if (res.data.success) {
        setLoginMessage('');
        setIsLoggedIn(true);
        setCurrentUser(res.data.user);
        setCurrentTab('dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      {currentTab !== 'login' && (
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onLoginClick={handleLoginClick}
        />
      )}

      {/* Main Content Area (Body) */}
      <main className="app-body" style={currentTab === 'login' ? { animation: 'none' } : {}}>
        {currentTab === 'dashboard' && (
          <DashboardView
            tasks={tasks}
            totalTasks={tasks.length}
            completedTasks={tasks.filter((t) => t.completed).length}
            currentUser={currentUser}
          />
        )}
        {currentTab === 'tasks' && (
          <ProjectsView
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onEditProject={handleEditProject}
            onUpdateActiveStatus={handleUpdateActiveStatus}
            onAddBulkTasks={handleAddBulkTasks}
            onUpdateSubTaskStatus={handleUpdateSubTaskStatus}
            onReorderSubTask={handleReorderSubTask}
            onEditSubTask={handleEditSubTask}
            onUpdateSubTaskRemark={handleUpdateSubTaskRemark}
            onUpdateSubTaskAttachment={handleUpdateSubTaskAttachment}
            currentUser={currentUser}
          />
        )}
        {currentTab === 'admin' && (
          <AdminView serverStatus={serverStatus} currentUser={currentUser} />
        )}
        {currentTab === 'login' && (
          <LoginView onLoginSubmit={handleLoginSubmit} message={loginMessage} />
        )}
      </main>

      {/* Footer */}
      {currentTab !== 'login' && <Footer serverStatus={serverStatus} />}
    </div>
  );
}

export default App;

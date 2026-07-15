import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminView.css';

const PERMISSION_MODULES = [
  { id: 'projects', label: 'Projects', actions: ['View', 'Add Task', 'View Task', 'Edit', 'Project Status'] },
  { id: 'tasks', label: 'Tasks', actions: ['View', 'Create', 'Edit', 'Delete', 'Comment', 'Attachment', 'Status Update'] },
  { id: 'admin', label: 'Admin', actions: ['View', 'Manage Roles', 'Manage Users'] }
];

function AdminView() {
  const [activeTab, setActiveTab] = useState('roles');
  
  // Roles State connected to Backend
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: {} });
  const [editingRoleId, setEditingRoleId] = useState(null);

  // Users State connected to Backend
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: '', status: 'Active' });
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
    if (activeTab === 'roles') {
      fetchRoles();
    }
  }, [activeTab]);

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`http://${window.location.hostname}:5000/api/roles`);
      setRoles(res.data);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://${window.location.hostname}:5000/api/users`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  // Handlers
  const handlePermissionToggle = (moduleId, action) => {
    setNewRole(prev => {
      const modulePerms = prev.permissions[moduleId] || [];
      const updatedModulePerms = modulePerms.includes(action)
        ? modulePerms.filter(a => a !== action)
        : [...modulePerms, action];
      return {
        ...prev,
        permissions: { ...prev.permissions, [moduleId]: updatedModulePerms }
      };
    });
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRole.name) return;
    
    if (editingRoleId) {
      try {
        const res = await axios.put(`http://${window.location.hostname}:5000/api/roles/${editingRoleId}`, newRole);
        setRoles(roles.map(r => r.id === editingRoleId ? res.data : r));
        setNewRole({ name: '', description: '', permissions: {} });
        setEditingRoleId(null);
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to update role');
      }
    } else {
      try {
        const res = await axios.post(`http://${window.location.hostname}:5000/api/roles`, newRole);
        setRoles([...roles, res.data]);
        setNewRole({ name: '', description: '', permissions: {} });
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to add role');
      }
    }
  };

  const handleDeleteRole = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await axios.delete(`http://${window.location.hostname}:5000/api/roles/${id}`);
        setRoles(roles.filter(r => r.id !== id));
      } catch (err) {
        console.error('Failed to delete role', err);
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.username || !newUser.role) return;
    
    if (editingUserId) {
      try {
        const res = await axios.put(`http://${window.location.hostname}:5000/api/users/${editingUserId}`, newUser);
        setUsers(users.map(u => u.id === editingUserId ? res.data : u));
        setNewUser({ name: '', username: '', password: '', role: '', status: 'Active' });
        setEditingUserId(null);
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to update user');
      }
    } else {
      if (!newUser.password) return; // password required for new users
      try {
        const res = await axios.post(`http://${window.location.hostname}:5000/api/users`, newUser);
        setUsers([...users, res.data]);
        setNewUser({ name: '', username: '', password: '', role: '', status: 'Active' });
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to add user');
      }
    }
  };

  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'In-Active' : 'Active';
    try {
      const res = await axios.put(`http://${window.location.hostname}:5000/api/users/${user.id}`, { ...user, status: newStatus });
      setUsers(users.map(u => u.id === user.id ? res.data : u));
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  return (
    <div className="admin-container" style={{ padding: '0', margin: '0 auto' }}>
      <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
        <button 
          className={`admin-tab ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
          style={{
            background: 'none', border: 'none', padding: '0.8rem 1.5rem', cursor: 'pointer',
            fontSize: '1rem', fontWeight: activeTab === 'roles' ? 'bold' : 'normal',
            borderBottom: activeTab === 'roles' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'roles' ? 'var(--primary)' : 'var(--text-light)',
            transition: 'all 0.2s'
          }}
        >
          Role Master
        </button>
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{
            background: 'none', border: 'none', padding: '0.8rem 1.5rem', cursor: 'pointer',
            fontSize: '1rem', fontWeight: activeTab === 'users' ? 'bold' : 'normal',
            borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-light)',
            transition: 'all 0.2s'
          }}
        >
          User Management
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'roles' && (
          <div className="admin-section">
            <div className="admin-card" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(0, 0, 0, 0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <form className="admin-form" onSubmit={handleAddRole} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Heading and Name */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <h2 className="section-heading" style={{ margin: 0, color: 'var(--text-heading)', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>{editingRoleId ? 'Edit Role' : 'Add New Role'}</h2>
                  <input 
                    type="text" 
                    placeholder="Role Name (e.g. Designer)" 
                    value={newRole.name} 
                    onChange={e => setNewRole({...newRole, name: e.target.value})}
                    required 
                    style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#ffffff', color: 'var(--text-heading)' }}
                  />
                </div>

                {/* Permissions Grid */}
                <div className="permissions-grid-wrapper" style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: 'var(--text-heading)' }}>Assign Module Permissions</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {PERMISSION_MODULES.map(module => (
                      <div key={module.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{module.label}</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {module.actions.map(action => {
                            const isChecked = newRole.permissions[module.id]?.includes(action);
                            return (
                              <label key={action} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <input 
                                  type="checkbox" 
                                  checked={!!isChecked}
                                  onChange={() => handlePermissionToggle(module.id, action)}
                                  style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                                />
                                {action}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  {editingRoleId && (
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ padding: '0.6rem 1.5rem' }}
                      onClick={() => {
                        setEditingRoleId(null);
                        setNewRole({ name: '', description: '', permissions: {} });
                      }}
                    >Cancel</button>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>{editingRoleId ? 'Update Role' : 'Add Role'}</button>
                </div>
              </form>
            </div>

            <h2 className="section-heading" style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Existing Roles</h2>
            <div className="table-container" style={{ overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)', width: '25%', fontSize: '0.85rem' }}>Role Name</th>
                    <th style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)', width: '65%', fontSize: '0.85rem' }}>Permissions</th>
                    <th style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)', textAlign: 'right', width: '10%', fontSize: '0.85rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => (
                    <tr key={role.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', fontSize: '0.85rem' }}>{role.name}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {Object.entries(role.permissions || {}).map(([modId, actions]) => {
                            if (!actions.length) return null;
                            const modLabel = PERMISSION_MODULES.find(m => m.id === modId)?.label || modId;
                            return (
                              <div key={modId} style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginRight: '4px' }}>{modLabel}:</span>
                                <span style={{ color: 'var(--text-muted)' }}>{actions.join(', ')}</span>
                              </div>
                            );
                          })}
                          {(!role.permissions || Object.keys(role.permissions).length === 0) && (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>No permissions</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => {
                          setEditingRoleId(role.id);
                          setNewRole({ name: role.name, description: role.description || '', permissions: role.permissions || {} });
                        }} title="Edit Role">✏️</button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleDeleteRole(role.id)} title="Delete Role">🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {roles.length === 0 && (
                    <tr><td colSpan="3" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>No roles found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="admin-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border)' }}>
              <h2 className="section-heading" style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-light)', fontSize: '1.1rem' }}>{editingUserId ? 'Edit User' : 'Add New User'}</h2>
              <form className="admin-form" onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto auto', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={newUser.name} 
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  required 
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#ffffff', color: 'var(--text-heading)' }}
                />
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={newUser.username} 
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  required 
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#ffffff', color: 'var(--text-heading)' }}
                />
                <input 
                  type="password" 
                  placeholder={editingUserId ? "New Password (Optional)" : "Password"} 
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  required={!editingUserId} 
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#ffffff', color: 'var(--text-heading)' }}
                />
                <select 
                  value={newUser.role} 
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  required
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#ffffff', color: 'var(--text-heading)' }}
                >
                  <option value="">-- Select Role --</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
                <select 
                  value={newUser.status} 
                  onChange={e => setNewUser({...newUser, status: e.target.value})}
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#ffffff', color: 'var(--text-heading)' }}
                >
                  <option value="Active">Active</option>
                  <option value="In-Active">In-Active</option>
                </select>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {editingUserId && (
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem' }} onClick={() => { setEditingUserId(null); setNewUser({ name: '', username: '', password: '', role: '', status: 'Active' }); }}>Cancel</button>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>{editingUserId ? 'Update User' : 'Add User'}</button>
                </div>
              </form>
            </div>

            <h2 className="section-heading" style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Existing Users</h2>
            <div className="table-container" style={{ overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Username</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Role</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{user.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{user.username}</td>
                      <td style={{ padding: '1rem' }}><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--primary)' }}>{user.role}</span></td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', background: user.status === 'Active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', color: user.status === 'Active' ? '#4caf50' : '#f44336' }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => {
                          setEditingUserId(user.id);
                          setNewUser({ name: user.name, username: user.username, password: '', role: user.role, status: user.status });
                        }} title="Edit User">✏️</button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleToggleUserStatus(user)} title="Toggle Status">
                          {user.status === 'Active' ? '🔴' : '🟢'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminView;

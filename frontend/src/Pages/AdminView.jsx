import React, { useState } from 'react';
import './AdminView.css';

const PERMISSION_MODULES = [
  { id: 'projects', label: 'Projects', actions: ['View', 'Create', 'Edit', 'Delete'] },
  { id: 'tasks', label: 'Tasks', actions: ['View', 'Create', 'Edit', 'Delete'] },
  { id: 'admin', label: 'Admin', actions: ['View', 'Manage Roles', 'Manage Users'] }
];

function AdminView() {
  const [activeTab, setActiveTab] = useState('roles');
  
  // Mock State for Roles
  const [roles, setRoles] = useState([
    { 
      id: 1, name: 'Super Admin', description: 'Full access to all modules.', 
      permissions: { projects: ['View', 'Create', 'Edit', 'Delete'], tasks: ['View', 'Create', 'Edit', 'Delete'], admin: ['View', 'Manage Roles', 'Manage Users'] } 
    }
  ]);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: {} });

  // Mock State for Users
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@kims.ac.in', role: 'Super Admin', status: 'Active' }
  ]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '', status: 'Active' });

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

  const handleAddRole = (e) => {
    e.preventDefault();
    if (!newRole.name) return;
    setRoles([...roles, { id: Date.now(), ...newRole }]);
    setNewRole({ name: '', description: '', permissions: {} });
  };

  const handleDeleteRole = (id) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.role) return;
    setUsers([...users, { id: Date.now(), ...newUser }]);
    setNewUser({ name: '', email: '', role: '', status: 'Active' });
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="admin-container" style={{ padding: '0', maxWidth: '1000px', margin: '0 auto' }}>
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
                  <h2 className="section-heading" style={{ margin: 0, color: 'var(--text-heading)', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Add New Role</h2>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {PERMISSION_MODULES.map(module => (
                      <div key={module.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{module.label}</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {module.actions.map(action => {
                            const isChecked = newRole.permissions[module.id]?.includes(action);
                            return (
                              <label key={action} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Add Role</button>
                </div>
              </form>
            </div>

            <h2 className="section-heading" style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Existing Roles</h2>
            <div className="table-container" style={{ overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', width: '20%' }}>Role Name</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', width: '25%' }}>Description</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', width: '45%' }}>Permissions</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right', width: '10%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(role => (
                    <tr key={role.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{role.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{role.description}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {Object.entries(role.permissions || {}).map(([modId, actions]) => {
                            if (!actions.length) return null;
                            const modLabel = PERMISSION_MODULES.find(m => m.id === modId)?.label || modId;
                            return (
                              <div key={modId} style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem' }}>
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
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleDeleteRole(role.id)} title="Delete Role">🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {roles.length === 0 && (
                    <tr><td colSpan="4" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>No roles found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="admin-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border)' }}>
              <h2 className="section-heading" style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-light)', fontSize: '1.1rem' }}>Add New User</h2>
              <form className="admin-form" onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={newUser.name} 
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  required 
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#ffffff', color: 'var(--text-heading)' }}
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  required 
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
                  <option value="Inactive">Inactive</option>
                </select>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>Add User</button>
              </form>
            </div>

            <h2 className="section-heading" style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Existing Users</h2>
            <div className="table-container" style={{ overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Name</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Email</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Role</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{user.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{user.email}</td>
                      <td style={{ padding: '1rem' }}><span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--primary)' }}>{user.role}</span></td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', background: user.status === 'Active' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', color: user.status === 'Active' ? '#4caf50' : '#f44336' }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => handleDeleteUser(user.id)} title="Delete User">🗑️</button>
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

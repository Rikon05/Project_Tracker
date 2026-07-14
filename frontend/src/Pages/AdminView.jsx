import React, { useState } from 'react';
import './AdminView.css';

function AdminView({ serverStatus }) {
  const [settings, setSettings] = useState({
    maintenance: false,
    verboseLogs: true,
    autoBackup: false
  });

  const handleToggle = (settingKey) => {
    setSettings((prev) => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));
  };

  return (
    <div className="admin-container">
      <h1 className="view-title">Administration Panel</h1>
      <p className="view-subtitle">Manage workspace settings and review system performance diagnostics.</p>

      <div className="admin-grid">
        {/* Diagnostics Card */}
        <div className="admin-card">
          <h2 className="section-heading">System Diagnostics</h2>
          <div className="diagnostic-list">
            <div className="diagnostic-item">
              <span className="diagnostic-label">Server Connection:</span>
              <span className={`diagnostic-value ${serverStatus === 'online' ? 'text-success' : 'text-error'}`} style={{ color: serverStatus === 'online' ? 'var(--success)' : 'var(--error)' }}>
                {serverStatus === 'online' ? 'Connected' : 'Offline'}
              </span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Backend Port:</span>
              <span className="diagnostic-value">5000</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Environment:</span>
              <span className="diagnostic-value">development</span>
            </div>
            <div className="diagnostic-item">
              <span className="diagnostic-label">Node Version:</span>
              <span className="diagnostic-value">v24.13.0</span>
            </div>
          </div>
        </div>

        {/* Configurations Card */}
        <div className="admin-card">
          <h2 className="section-heading">System Settings</h2>
          <div className="control-list">
            <div className="control-item">
              <div className="control-label-group">
                <span className="control-label">Maintenance Mode</span>
                <span className="control-desc">Redirect frontend requests to maintenance page</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.maintenance}
                  onChange={() => handleToggle('maintenance')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="control-item">
              <div className="control-label-group">
                <span className="control-label">Verbose Logging</span>
                <span className="control-desc">Log database queries and HTTP API hits</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.verboseLogs}
                  onChange={() => handleToggle('verboseLogs')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="control-item">
              <div className="control-label-group">
                <span className="control-label">Automatic Daily Backup</span>
                <span className="control-desc">Create daily SQL dump of user data</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={() => handleToggle('autoBackup')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminView;

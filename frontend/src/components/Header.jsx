import React from 'react';

function Header({ currentTab, setCurrentTab, isLoggedIn, currentUser, onLoginClick }) {
  const hasAdminView = currentUser?.permissions?.admin?.includes('View');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tasks', label: 'Projects' }
  ];
  if (hasAdminView) {
    tabs.push({ id: 'admin', label: 'Admin' });
  }

  return (
    <header className="app-header">
      {/* Left Edge: Logo */}
      <div className="logo-container" onClick={() => setCurrentTab('dashboard')}>
        <div className="logo-icon">✓</div>
        <span className="logo-text">TrackerPro</span>
      </div>

      {/* Center: Navigation Links */}
      <nav>
        <ul className="nav-links">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={`nav-item ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(tab.id)}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </nav>

      {/* Right Edge: Login Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isLoggedIn && currentUser && (
          <span style={{ fontWeight: '600', color: 'var(--text-heading)', fontSize: '0.95rem' }}>
            Hi, {currentUser.name}
          </span>
        )}
        <button className="btn btn-primary" onClick={onLoginClick}>
          {isLoggedIn ? 'Logout' : 'Login'}
        </button>
      </div>
    </header>
  );
}

export default Header;

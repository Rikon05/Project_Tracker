import React from 'react';

function Header({ currentTab, setCurrentTab, isLoggedIn, onLoginClick }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tasks', label: 'Projects' },
    { id: 'admin', label: 'Admin' }
  ];

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
      <div>
        <button className="btn btn-primary" onClick={onLoginClick}>
          {isLoggedIn ? 'Logout' : 'Login'}
        </button>
      </div>
    </header>
  );
}

export default Header;

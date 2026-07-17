import React from 'react';

function Footer({ serverStatus }) {
  const currentYear = new Date().getFullYear();
  const isOnline = serverStatus === 'online';

  return (
    <footer className="app-footer">
      <div>
        <span>&copy; {currentYear} TrackerPro. All rights reserved.</span>
      </div>

      <div className="status-container">
        {isOnline ? (
          <div className="status-badge online" title="Express server is running on port 5001">
            <span className="status-dot"></span>
            <span>Server Online</span>
          </div>
        ) : (
          <div className="status-badge offline" title="Express server is unreachable">
            <span className="status-dot"></span>
            <span>Server Offline</span>
          </div>
        )}
      </div>
    </footer>
  );
}

export default Footer;

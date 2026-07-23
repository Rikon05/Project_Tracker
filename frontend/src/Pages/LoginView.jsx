import React, { useState } from 'react';
import './LoginView.css';

function LoginView({ onLoginSubmit, message }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSubmit(username, password);
  };

  // Generate 40 dashes for the circular border
  const dashes = Array.from({ length: 40 });

  return (
    <div className="login-view-container">
      {message && <div className="login-message-banner">{message}</div>}

      <div className="login-radial-wrapper">
        <img src="/kims-logo.png" alt="KIMS Logo Watermark" className="login-watermark" />

        {/* Render the radial dashes */}
        <div className="radial-dashes">
          {dashes.map((_, i) => {
            return (
              <div
                key={i}
                className="dash animated-dash"
                style={{
                  transform: `rotate(${i * 9}deg) translateY(-180px)`,
                  animationDelay: `-${(40 - i) * 0.1}s`
                }}
              />
            );
          })}
        </div>

        <div className="login-card">
          <h2 className="login-title">Login</h2>

          <form className="login-form-custom" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>


            <button type="submit" className="login-btn-custom">Login</button>
          </form>
        </div>
      </div>

      <div className="app-title-container">
        <span className="app-title">Tracker PRO</span>
      </div>
    </div>
  );
}

export default LoginView;

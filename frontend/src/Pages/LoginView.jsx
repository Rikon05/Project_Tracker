import React, { useState } from 'react';
import './LoginView.css';

function LoginView({ onLoginSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSubmit(email, password);
  };

  // Generate 40 dashes for the circular border
  const dashes = Array.from({ length: 40 });

  return (
    <div className="login-view-container">
      <div className="login-radial-wrapper">
        <img src="/kims-logo.png" alt="KIMS Logo Watermark" className="login-watermark" />

        {/* Render the radial dashes */}
        <div className="radial-dashes">
          {dashes.map((_, i) => {
            // Top-left dashes are cyan. Using a 40-dash circle (9deg each).
            // Indices ~27 to ~36 map to the top-left area.
            const isCyan = i >= 28 && i <= 34;
            return (
              <div
                key={i}
                className={`dash ${isCyan ? 'cyan-dash' : 'dark-dash'}`}
                style={{ transform: `rotate(${i * 9}deg) translateY(-180px)` }}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <div className="app-title-container">
              <span className="app-title">Project Tracker</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginView;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { EMPLOYEES } from '../config';

export default function Login() {
  const { login, loginError, clearError } = useAuth();
  const [user, setUser] = useState('');
  const [pin, setPin] = useState('');

  const needsPin = user !== '';
  const pinLabel =
    user === 'regional' ? 'PIN Περιφερειακής' : user === 'admin' ? 'PIN Διαχειριστή' : 'PIN Εργαζομένου';

  function handleUserChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setUser(e.target.value);
    setPin('');
    clearError();
  }

  function handleLogin() {
    if (!user) return;
    login(user, pin);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div id="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <img
            src="https://raw.githubusercontent.com/Geokaf13/panepistimiou-assets/refs/heads/main/065.png"
            alt="icon"
          />
        </div>
        <h1>ΚΑΤΑΣΤΗΜΑ ΠΑΝΕΠΙΣΤΗΜΙΟΥ</h1>

        <div className="login-group">
          <label>Σύνδεση ως</label>
          <select value={user} onChange={handleUserChange}>
            <option value="">— Επιλέξτε —</option>
            <option value="admin">👤 ΚΑΦΕΤΖΟΠΟΥΛΟΣ ΓΕΩΡΓΙΟΣ (ADMIN)</option>
            <option value="regional">🏢 ΠΕΡΙΦΕΡΕΙΑ ΝΟΤΙΟΥ ΕΛΛΑΔΟΣ</option>
            <optgroup label="Εργαζόμενοι">
              {EMPLOYEES.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {needsPin && (
          <div className="login-group">
            <label>{pinLabel}</label>
            <input
              type="password"
              placeholder="••••"
              maxLength={10}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}

        <button className="login-btn" onClick={handleLogin}>
          Είσοδος
        </button>
        {loginError && <div className="login-error" style={{ display: 'block' }}>Λάθος PIN. Προσπαθήστε ξανά.</div>}
      </div>
    </div>
  );
}

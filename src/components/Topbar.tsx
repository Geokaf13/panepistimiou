import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { currentUser, logout } = useAuth();
  return (
    <div className="topbar">
      <div className="topbar-title">
        ΠΑΝΕΠΙΣΤΗΜΙΟΥ <span>065</span>
      </div>
      <div className="topbar-right">
        <div className="user-badge">{currentUser}</div>
        <button className="logout-btn" onClick={logout}>
          Έξοδος
        </button>
      </div>
    </div>
  );
}

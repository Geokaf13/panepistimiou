import React, { createContext, useContext, useState } from 'react';
import { ADMIN_PIN, REGIONAL_PIN, EMPLOYEE_PINS } from '../config';
import type { Role } from '../types';

interface AuthContextValue {
  currentUser: string | null;
  currentRole: Role;
  loginError: boolean;
  login: (user: string, pin: string) => boolean;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>(null);
  const [loginError, setLoginError] = useState(false);

  function login(user: string, pin: string): boolean {
    if (!user) return false;

    if (user === 'admin') {
      if (pin !== ADMIN_PIN) { setLoginError(true); return false; }
      setCurrentRole('admin');
      setCurrentUser('Διαχειριστής');
    } else if (user === 'regional') {
      if (pin !== REGIONAL_PIN) { setLoginError(true); return false; }
      setCurrentRole('regional');
      setCurrentUser('Περιφέρεια Νοτίου Ελλάδος');
    } else {
      if (pin !== EMPLOYEE_PINS[user]) { setLoginError(true); return false; }
      setCurrentRole('employee');
      setCurrentUser(user);
    }
    setLoginError(false);
    return true;
  }

  function logout() {
    setCurrentUser(null);
    setCurrentRole(null);
    setLoginError(false);
  }

  function clearError() {
    setLoginError(false);
  }

  return (
    <AuthContext.Provider value={{ currentUser, currentRole, loginError, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

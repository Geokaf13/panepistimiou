import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Login from './components/Login';
import Topbar from './components/Topbar';
import AdminView from './components/admin/AdminView';
import EmployeeView from './components/employee/EmployeeView';
import RegionalView from './components/regional/RegionalView';

function Shell() {
  const { currentRole } = useAuth();

  if (!currentRole) return <Login />;

  return (
    <div id="app">
      <Topbar />
      {currentRole === 'admin' && <AdminView />}
      {currentRole === 'employee' && <EmployeeView />}
      {currentRole === 'regional' && <RegionalView />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </AuthProvider>
  );
}

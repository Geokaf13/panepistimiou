import React from 'react';
import { useAuth } from '../../context/AuthContext';
import TargetsView from '../shared/TargetsView';
import EmployeeStats from './EmployeeStats';
import MyVacations from './MyVacations';
import MyOvertimes from './MyOvertimes';
import MyRally from './MyRally';

export default function EmployeeView() {
  const { currentUser } = useAuth();

  return (
    <div className="container">
      <div className="emp-greeting">
        <h2>{currentUser}</h2>
        <p>Τα στοιχεία παραγωγής σας για το 2026</p>
      </div>

      <EmployeeStats />

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h2>Στόχοι 2026</h2></div>
        <div className="card-body">
          <TargetsView />
          <div className="targets-note">Στατική απεικόνιση ετήσιων στόχων καταστήματος για το 2026.</div>
        </div>
      </div>

      <MyVacations />
      <MyOvertimes />
      <MyRally />
    </div>
  );
}

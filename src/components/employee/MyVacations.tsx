import React, { useEffect, useState } from 'react';
import sb from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { fmtVacDate } from '../../lib/utils';

interface Row { id: string; from_date: string; to_date: string; workdays: number }

export default function MyVacations() {
  const { currentUser } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      if (!sb || !currentUser) return;
      const { data, error } = await sb.from('vacations').select('*').eq('employee', currentUser).order('from_date');
      if (error) return;
      setRows(data || []);
    })();
  }, [currentUser]);

  const total = rows.reduce((s, r) => s + (r.workdays || 0), 0);

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header"><h2>🌴 Οι Άδειές μου 2026</h2></div>
      <div className="card-body" style={{ padding: '0 0 4px' }}>
        <div style={{ padding: '18px 24px 0' }}>
          <span className="vac-badge">{total} εργάσιμες ημέρες συνολικά</span>
        </div>
        <table className="vac-list-table" style={{ marginTop: 14 }}>
          <thead><tr><th>#</th><th>Από</th><th>Έως</th><th>Εργάσιμες</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>{fmtVacDate(r.from_date)}</td>
                <td>{fmtVacDate(r.to_date)}</td>
                <td>{r.workdays}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty-state">Δεν έχετε καταχωρημένες άδειες.</div>}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import sb from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { fmtHours, fmtVacDate } from '../../lib/utils';

interface Row { id: string; date: string; hours: number }

export default function MyOvertimes() {
  const { currentUser } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      if (!sb || !currentUser) return;
      const { data, error } = await sb.from('overtimes').select('*').eq('employee', currentUser).order('date');
      if (error) return;
      setRows((data || []).map((r: any) => ({ id: r.id, date: r.date, hours: parseFloat(r.hours) })));
    })();
  }, [currentUser]);

  const total = rows.reduce((s, r) => s + r.hours, 0);

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header"><h2>⏱️ Οι Υπερωρίες μου 2026</h2></div>
      <div className="card-body" style={{ padding: '0 0 4px' }}>
        <div style={{ padding: '18px 24px 0' }}>
          <span className="ot-hours-badge" style={{ fontSize: 14 }}>{fmtHours(total)}h συνολικά</span>
        </div>
        <table className="ot-table" style={{ marginTop: 14 }}>
          <thead><tr><th>#</th><th>Ημερομηνία</th><th>Ώρες</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>{fmtVacDate(r.date)}</td>
                <td><span className="ot-hours-badge">{fmtHours(r.hours)}h</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty-state">Δεν έχετε καταχωρημένες υπερωρίες.</div>}
      </div>
    </div>
  );
}

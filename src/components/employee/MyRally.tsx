import React, { useEffect, useState } from 'react';
import sb from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fmtVacDate } from '../../lib/utils';
import { RallyStatusBadge } from '../shared/RallyBadges';
import type { RallyStatus } from '../../types';

interface RawCard {
  employee: string;
  status: RallyStatus;
  application_date: string | null;
  customer_name: string;
}

export default function MyRally() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [all, setAll] = useState<RawCard[]>([]);

  useEffect(() => {
    (async () => {
      if (!sb) return;
      const { data, error } = await sb.from('card_rally').select('*');
      if (error) {
        if (error.code !== '42P01') showToast('Σφάλμα φόρτωσης: ' + error.message, 'error');
        return;
      }
      setAll(data || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mine = all.filter((c) => c.employee === currentUser);
  const ok = mine.filter((c) => c.status === 'ΝΑΙ').length;
  const no = mine.filter((c) => c.status === 'ΟΧΙ').length;
  const pend = mine.filter((c) => c.status === 'ΕΠΕΞΕΡΓΑΣΙΑ').length;
  const pct = all.length > 0 ? Math.round((mine.length / all.length) * 100) : 0;

  const sorted = [...mine].sort((a, b) => (b.application_date || '').localeCompare(a.application_date || ''));

  return (
    <div className="card">
      <div className="card-header"><h2>🏆 Το Ράλλυ Καρτών μου</h2></div>
      <div className="card-body" style={{ padding: '18px 24px 4px' }}>
        <div className="rally-hero" style={{ marginBottom: 18 }}>
          <div>
            <h3>Σύνολο Καταστήματος</h3>
            <div className="rh-num"><span>{all.length}</span><span>αιτήσεις</span></div>
          </div>
          <div className="rally-hero-stats">
            <div className="rally-hero-stat"><div className="rhs-val">{all.filter((c) => c.status === 'ΝΑΙ').length}</div><div className="rhs-lbl">Εγκρίσεις</div></div>
            <div className="rally-hero-stat"><div className="rhs-val">{all.filter((c) => c.status === 'ΟΧΙ').length}</div><div className="rhs-lbl">Απορρίψεις</div></div>
            <div className="rally-hero-stat"><div className="rhs-val">{all.filter((c) => c.status === 'ΕΠΕΞΕΡΓΑΣΙΑ').length}</div><div className="rhs-lbl">Επεξεργασία</div></div>
          </div>
        </div>

        <div className="emp-stats-grid" style={{ marginBottom: 18 }}>
          {[['Αιτήσεις', mine.length], ['Εγκρίσεις', ok], ['Απορρίψεις', no], ['Επεξεργασία', pend]].map(([label, val]) => (
            <div className="stat-chip" key={label}>
              <div className="sc-label">{label}</div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="rally-my-bar">
          <div className="rmb-top">
            <strong>Συνεισφορά στο σύνολο καταστήματος</strong>
            <span>{pct}%</span>
          </div>
          <div className="rally-my-track">
            <div className="rally-my-fill" style={{ width: pct + '%' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>
            {mine.length} από {all.length} συνολικές αιτήσεις καταστήματος
          </div>
        </div>

        <table className="vac-list-table">
          <thead><tr><th>#</th><th>Πελάτης</th><th>Κατάσταση</th><th>Ημερομηνία</th></tr></thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{c.customer_name}</td>
                <td><RallyStatusBadge status={c.status} /></td>
                <td>{c.application_date ? fmtVacDate(c.application_date) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!mine.length && <div className="empty-state">Δεν έχετε καταχωρημένες αιτήσεις καρτών.</div>}
      </div>
    </div>
  );
}

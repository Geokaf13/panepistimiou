import React, { useEffect, useState } from 'react';
import sb from '../../lib/supabaseClient';
import { CATEGORIES, MONTHS_GR } from '../../config';
import { getMonthDateRange } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeStats() {
  const { currentUser } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function loadStats(m: number) {
    setLoading(true);
    if (!sb || !currentUser) { setTotals({}); setLoading(false); return; }
    const range = getMonthDateRange(2026, m);
    const { data, error } = await sb
      .from('productions')
      .select('*')
      .eq('employee', currentUser)
      .gte('date', range.start)
      .lte('date', range.end);

    if (error) { setTotals({}); setLoading(false); return; }

    const t = Object.fromEntries(CATEGORIES.map((c) => [c.name, 0]));
    (data || []).forEach((row: any) => {
      if (t[row.category] !== undefined) t[row.category] += row.value;
    });
    setTotals(t);
    setLoading(false);
  }

  const nonZeroCats = CATEGORIES.filter((c) => totals[c.name]);

  return (
    <>
      <div className="month-tabs">
        {MONTHS_GR.slice(1).map((label, i) => {
          const m = i + 1;
          return (
            <button key={m} className={`month-tab${m === month ? ' active' : ''}`} onClick={() => setMonth(m)}>
              {label.slice(0, 3)}
            </button>
          );
        })}
      </div>

      <div className="emp-stats-grid">
        {loading && <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>Φόρτωση...</div>}
        {!loading && nonZeroCats.length === 0 && (
          <div style={{ color: 'var(--gray-400)', fontSize: 13, padding: '8px 0' }}>
            Δεν υπάρχουν εγγραφές για αυτό τον μήνα.
          </div>
        )}
        {!loading &&
          nonZeroCats.map((cat) => (
            <div className={`stat-chip${cat.amount ? ' is-amount' : ''}`} key={cat.name}>
              <div className="sc-label">{cat.name}</div>
              <div className="sc-val">{cat.amount ? totals[cat.name].toLocaleString('el-GR') + '€' : totals[cat.name]}</div>
            </div>
          ))}
      </div>
    </>
  );
}

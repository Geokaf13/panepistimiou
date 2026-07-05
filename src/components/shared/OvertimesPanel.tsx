import React, { useEffect, useState } from 'react';
import sb from '../../lib/supabaseClient';
import { EMPLOYEES, OT_BUDGET } from '../../config';
import { downloadCSV, fmtHours, fmtVacDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import type { Overtime } from '../../types';

const HOUR_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

interface Props {
  readOnly: boolean;
}

export default function OvertimesPanel({ readOnly }: Props) {
  const { showToast } = useToast();
  const [overtimes, setOvertimes] = useState<Overtime[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const [emp, setEmp] = useState('');
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState('1');

  useEffect(() => {
    loadOvertimes();
  }, []);

  async function loadOvertimes() {
    if (!sb) { setOvertimes([]); return; }
    const { data, error } = await sb.from('overtimes').select('*').order('date');
    if (error) {
      if (error.code === '42P01') showToast('Ο πίνακας "overtimes" δεν υπάρχει ακόμα στο Supabase.', 'error');
      else showToast('Σφάλμα φόρτωσης υπερωριών: ' + error.message, 'error');
      setOvertimes([]);
      return;
    }
    setOvertimes((data || []).map((r: any) => ({ id: r.id, employee: r.employee, date: r.date, hours: parseFloat(r.hours) })));
  }

  const totalUsed = overtimes.reduce((s, o) => s + o.hours, 0);
  const remaining = OT_BUDGET - totalUsed;
  const pct = Math.min((totalUsed / OT_BUDGET) * 100, 100);

  async function addOvertime() {
    if (!emp) { showToast('Επιλέξτε εργαζόμενο', 'error'); return; }
    if (!date) { showToast('Επιλέξτε ημερομηνία', 'error'); return; }
    const h = parseFloat(hours);

    if (totalUsed + h > OT_BUDGET) {
      showToast(`⚠️ Υπέρβαση budget! Διαθέσιμες: ${fmtHours(OT_BUDGET - totalUsed)} ώρες`, 'error');
      return;
    }
    if (!sb) {
      setOvertimes((prev) => [...prev, { id: String(Date.now()), employee: emp, date, hours: h }]);
      showToast(`✓ ${emp.split(' ')[0]} — ${fmtHours(h)}h`, 'success');
      return;
    }
    const { data, error } = await sb.from('overtimes').insert({ employee: emp, date, hours: h }).select();
    if (error) { showToast('Σφάλμα: ' + error.message, 'error'); return; }

    const savedHours = parseFloat(data[0].hours);
    if (Math.abs(savedHours - h) > 0.001) {
      showToast(`⚠️ Η βάση αποθήκευσε ${fmtHours(savedHours)}h αντί για ${fmtHours(h)}h — ελέγξτε τον τύπο της στήλης "hours".`, 'error');
    } else {
      showToast(`✓ ${emp.split(' ')[0]} — ${fmtHours(savedHours)} ώρ. καταχωρήθηκαν`, 'success');
    }
    setOvertimes((prev) => [...prev, { id: data[0].id, employee: emp, date, hours: savedHours }]);
  }

  async function deleteOvertime(id: string) {
    if (!confirm('Διαγραφή αυτής της υπερωρίας;')) return;
    if (sb) {
      const { error } = await sb.from('overtimes').delete().eq('id', id);
      if (error) { showToast('Σφάλμα: ' + error.message, 'error'); return; }
    }
    setOvertimes((prev) => prev.filter((o) => o.id !== id));
    showToast('Η υπερωρία διαγράφηκε');
  }

  function exportOtCSV() {
    let csv = 'Εργαζόμενος,Ημερομηνία,Ώρες\n';
    [...overtimes].sort((a, b) => a.date.localeCompare(b.date)).forEach((o) => { csv += `${o.employee},${o.date},${o.hours}\n`; });
    csv += '\nΣύνολα ανά εργαζόμενο\nΕργαζόμενος,Σύνολο ωρών\n';
    EMPLOYEES.forEach((e) => {
      const h = overtimes.filter((o) => o.employee === e).reduce((s, o) => s + o.hours, 0);
      if (h > 0) csv += `${e},${h}\n`;
    });
    csv += `\nΣΥΝΟΛΟ ΚΑΤΑΣΤΗΜΑΤΟΣ,${totalUsed}\nBUDGET,${OT_BUDGET}\nΔΙΑΘΕΣΙΜΕΣ,${OT_BUDGET - totalUsed}\n`;
    downloadCSV(csv, 'yperwries_2026.csv');
  }

  const sorted = [...overtimes].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="ot-budget-bar">
        <div className="ot-budget-left">
          <h3>⏱️ Budget Υπερωριών 2026</h3>
          <div className="ot-numbers">
            <span>{fmtHours(totalUsed)}</span> / <span style={{ opacity: 0.7 }}>{OT_BUDGET}</span> <span>ώρες</span>
          </div>
          <div className="ot-progress-wrap">
            <div className="ot-progress-track">
              <div className={`ot-progress-fill${pct >= 100 ? ' over' : ''}`} style={{ width: pct + '%' }} />
            </div>
          </div>
        </div>
        <div className="ot-budget-right">
          <div className="ot-remain">Διαθέσιμες</div>
          <div className="ot-remain"><strong>{fmtHours(remaining)}</strong> ώρες</div>
        </div>
      </div>

      {!readOnly && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><h2>Καταχώρηση Υπερωρίας</h2></div>
          <div className="card-body">
            <div className="entry-controls">
              <div className="field-group">
                <label>Εργαζόμενος</label>
                <select value={emp} onChange={(e) => setEmp(e.target.value)}>
                  <option value="">— Επιλέξτε —</option>
                  {EMPLOYEES.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>Ημερομηνία</label>
                <input type="date" min="2026-01-01" max="2026-12-31" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="field-group">
                <label>Ώρες</label>
                <select className="ot-hours-select" value={hours} onChange={(e) => setHours(e.target.value)}>
                  {HOUR_OPTIONS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <button className="save-btn" style={{ background: '#6d28d9' }} onClick={addOvertime}>+ Προσθήκη</button>
            </div>
          </div>
        </div>
      )}

      <div className="ot-emp-grid">
        {EMPLOYEES.map((e) => {
          const h = overtimes.filter((o) => o.employee === e).reduce((s, o) => s + o.hours, 0);
          return (
            <div className="ot-emp-chip" key={e}>
              <div className="oec-name">{e.split(' ')[0]}</div>
              <div className="oec-val">{fmtHours(h)}</div>
              <div className="oec-sub">{h === 1 ? 'ώρα' : 'ώρες'}</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Λίστα Υπερωριών</h2>
          <button className="export-link-btn" onClick={exportOtCSV}>⬇ Εξαγωγή CSV</button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="ot-table">
            <thead>
              <tr><th>#</th><th>Εργαζόμενος</th><th>Ημερομηνία</th><th>Ώρες</th>{!readOnly && <th></th>}</tr>
            </thead>
            <tbody>
              {sorted.map((o, i) => (
                <tr key={o.id}>
                  <td>{sorted.length - i}</td>
                  <td>{o.employee}</td>
                  <td>{fmtVacDate(o.date)}</td>
                  <td><span className="ot-hours-badge">{fmtHours(o.hours)}h</span></td>
                  {!readOnly && <td><button className="del-btn" onClick={() => deleteOvertime(o.id)}>Διαγραφή</button></td>}
                </tr>
              ))}
              <tr className="ot-total-row">
                <td colSpan={3}><strong>ΣΥΝΟΛΟ ΚΑΤΑΣΤΗΜΑΤΟΣ</strong></td>
                <td><span className="ot-hours-badge" style={{ background: '#ede9fe', fontSize: 14 }}>{fmtHours(totalUsed)}h / {OT_BUDGET}h</span></td>
                {!readOnly && <td></td>}
              </tr>
            </tbody>
          </table>
          {!overtimes.length && <div className="empty-state">Δεν υπάρχουν καταχωρημένες υπερωρίες ακόμα.</div>}
        </div>
      </div>
    </>
  );
}

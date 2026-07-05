import React, { useEffect, useMemo, useState } from 'react';
import sb from '../../lib/supabaseClient';
import { VACATION_PEOPLE } from '../../config';
import { allDates, countWorkdays, downloadCSV, fmtVacDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import type { Vacation } from '../../types';
import VacationCalendar from './VacationCalendar';

interface Props {
  readOnly: boolean;
}

export default function VacationsPanel({ readOnly }: Props) {
  const { showToast } = useToast();
  const [vacations, setVacations] = useState<Vacation[]>([]);

  // Add-form state (admin only)
  const [addEmp, setAddEmp] = useState('');
  const [addFrom, setAddFrom] = useState('2026-01-01');
  const [addTo, setAddTo] = useState('2026-01-01');

  // Filters
  const [filterEmp, setFilterEmp] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    loadVacations();
  }, []);

  async function loadVacations() {
    if (!sb) {
      setVacations([]);
      return;
    }
    const { data, error } = await sb.from('vacations').select('*').order('from_date');
    if (error) {
      showToast('Σφάλμα φόρτωσης αδειών: ' + error.message, 'error');
      return;
    }
    setVacations(
      (data || []).map((r: any) => ({ id: r.id, employee: r.employee, from: r.from_date, to: r.to_date, workdays: r.workdays }))
    );
  }

  async function addVacation() {
    if (!addEmp) { showToast('Επιλέξτε εργαζόμενο', 'error'); return; }
    if (!addFrom || !addTo) { showToast('Συμπληρώστε ημερομηνίες', 'error'); return; }
    if (addFrom > addTo) { showToast('Το "Από" πρέπει να είναι πριν το "Έως"', 'error'); return; }
    if (!sb) { showToast('Δεν υπάρχει σύνδεση Supabase', 'error'); return; }

    const wdays = countWorkdays(addFrom, addTo);
    const { error } = await sb.from('vacations').insert({ employee: addEmp, from_date: addFrom, to_date: addTo, workdays: wdays });
    if (error) { showToast('Σφάλμα: ' + error.message, 'error'); return; }

    showToast(`✓ ${addEmp.split(' ')[0]} — ${wdays} εργάσιμες ημέρες`, 'success');
    loadVacations();
  }

  async function deleteVacation(id: string) {
    if (!confirm('Διαγραφή αυτής της άδειας;')) return;
    if (!sb) return;
    const { error } = await sb.from('vacations').delete().eq('id', id);
    if (error) { showToast('Σφάλμα: ' + error.message, 'error'); return; }
    showToast('Η άδεια διαγράφηκε');
    loadVacations();
  }

  function exportVacCSV() {
    let csv = 'Εργαζόμενος,Από,Έως,Εργάσιμες\n';
    vacations.forEach((v) => { csv += `${v.employee},${v.from},${v.to},${v.workdays}\n`; });
    downloadCSV(csv, 'adeies_2026.csv');
  }

  const vacSet = useMemo(() => {
    const set: Record<string, Set<string>> = {};
    VACATION_PEOPLE.forEach((e) => (set[e] = new Set()));
    vacations.forEach((v) => {
      allDates(v.from, v.to).forEach((d) => set[v.employee]?.add(d));
    });
    return set;
  }, [vacations]);

  const filtered = useMemo(() => {
    let f = vacations;
    if (filterEmp) f = f.filter((v) => v.employee === filterEmp);
    if (filterMonth) f = f.filter((v) => v.from.slice(5, 7) === filterMonth || v.to.slice(5, 7) === filterMonth);
    return f;
  }, [vacations, filterEmp, filterMonth]);

  const totalDaysFiltered = filtered.reduce((s, v) => s + v.workdays, 0);

  return (
    <>
      {!readOnly && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <h2>Καταχώρηση Νέας Άδειας</h2>
          </div>
          <div className="card-body">
            <div className="entry-controls">
              <div className="field-group">
                <label>Εργαζόμενος</label>
                <select value={addEmp} onChange={(e) => setAddEmp(e.target.value)}>
                  <option value="">— Επιλέξτε —</option>
                  {VACATION_PEOPLE.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label>Από</label>
                <input type="date" min="2026-01-01" max="2026-12-31" value={addFrom} onChange={(e) => setAddFrom(e.target.value)} />
              </div>
              <div className="field-group">
                <label>Έως</label>
                <input type="date" min="2026-01-01" max="2026-12-31" value={addTo} onChange={(e) => setAddTo(e.target.value)} />
              </div>
              <button className="save-btn" onClick={addVacation}>+ Προσθήκη</button>
            </div>
            <div className="targets-note">Τα Σαββατοκύριακα εξαιρούνται αυτόματα από τις εργάσιμες ημέρες.</div>
          </div>
        </div>
      )}

      <div className="emp-stats-grid" style={{ marginBottom: 24 }}>
        {VACATION_PEOPLE.map((emp) => {
          const days = vacations.filter((v) => v.employee === emp).reduce((s, v) => s + v.workdays, 0);
          return (
            <div className="stat-chip" key={emp}>
              <div className="sc-label">{emp.split(' ')[0]}</div>
              <div className="sc-val">{days}</div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h2>Ημερολόγιο Αδειών 2026</h2></div>
        <div className="card-body" style={{ padding: 16 }}>
          <VacationCalendar people={VACATION_PEOPLE} vacSet={vacSet} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Λίστα Καταχωρημένων Αδειών</h2>
          <button className="export-link-btn" onClick={exportVacCSV}>⬇ Εξαγωγή CSV</button>
        </div>
        <div className="card-body" style={{ padding: '16px 24px 0' }}>
          <div className="vac-filters">
            <div className="field-group">
              <label>Εργαζόμενος</label>
              <select value={filterEmp} onChange={(e) => setFilterEmp(e.target.value)}>
                <option value="">Όλοι</option>
                {VACATION_PEOPLE.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Μήνας</label>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                <option value="">Όλοι</option>
                <option value="01">Ιανουάριος</option><option value="02">Φεβρουάριος</option><option value="03">Μάρτιος</option>
                <option value="04">Απρίλιος</option><option value="05">Μάιος</option><option value="06">Ιούνιος</option>
                <option value="07">Ιούλιος</option><option value="08">Αύγουστος</option><option value="09">Σεπτέμβριος</option>
                <option value="10">Οκτώβριος</option><option value="11">Νοέμβριος</option><option value="12">Δεκέμβριος</option>
              </select>
            </div>
            <div className="filter-results-info">
              {filtered.length ? `${filtered.length} εγγραφές — ${totalDaysFiltered} εργάσιμες` : ''}
            </div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="vac-list-table">
            <thead>
              <tr>
                <th>#</th><th>Εργαζόμενος</th><th>Από</th><th>Έως</th><th>Εργάσιμες</th>{!readOnly && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <tr key={v.id}>
                  <td>{i + 1}</td>
                  <td>{v.employee}</td>
                  <td>{fmtVacDate(v.from)}</td>
                  <td>{fmtVacDate(v.to)}</td>
                  <td>{v.workdays}</td>
                  {!readOnly && (
                    <td><button className="del-btn" onClick={() => deleteVacation(v.id)}>Διαγραφή</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="empty-state">Δεν υπάρχουν καταχωρημένες άδειες ακόμα.</div>
          )}
        </div>
      </div>
    </>
  );
}

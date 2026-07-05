import React, { useEffect, useState } from 'react';
import sb from '../../lib/supabaseClient';
import { CATEGORIES, EMPLOYEES } from '../../config';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

export default function EntryTab() {
  const { showToast } = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [employee, setEmployee] = useState('');
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.name, 0]))
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (date && employee) loadExistingEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, employee]);

  async function loadExistingEntry() {
    if (!sb) return;
    const { data, error } = await sb.from('productions').select('*').eq('date', date).eq('employee', employee);
    if (error) {
      showToast('Σφάλμα φόρτωσης: ' + error.message, 'error');
      return;
    }
    const reset = Object.fromEntries(CATEGORIES.map((c) => [c.name, 0]));
    (data || []).forEach((row: any) => {
      if (reset[row.category] !== undefined) reset[row.category] = row.value;
    });
    setValues(reset);
    if (data && data.length) showToast('Φορτώθηκαν υπάρχοντα δεδομένα', 'success');
  }

  function onInputChange(cat: string, val: string) {
    setValues((v) => ({ ...v, [cat]: parseFloat(val) || 0 }));
  }

  async function saveEntry() {
    if (!date || !employee) return;
    setSaving(true);
    if (!sb) {
      setSaving(false);
      showToast('Δεν υπάρχει σύνδεση Supabase', 'error');
      return;
    }
    const rows = CATEGORIES.map((cat) => ({
      date,
      employee,
      category: cat.name,
      value: values[cat.name] || 0,
    }));
    const { error } = await sb.from('productions').upsert(rows, { onConflict: 'date,employee,category' });
    setSaving(false);
    if (error) showToast('Σφάλμα: ' + error.message, 'error');
    else showToast('✓ Αποθηκεύτηκε επιτυχώς!', 'success');
  }

  const ready = Boolean(date && employee);

  return (
    <div className="card">
      <div className="card-header">
        <h2>Εισαγωγή Ημερήσιων Παραγωγών</h2>
      </div>
      <div className="card-body">
        <div className="entry-controls">
          <div className="field-group">
            <label>Ημερομηνία</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field-group">
            <label>Εργαζόμενος</label>
            <select value={employee} onChange={(e) => setEmployee(e.target.value)}>
              <option value="">— Επιλέξτε —</option>
              {EMPLOYEES.map((emp) => (
                <option key={emp}>{emp}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="entry-table-wrap">
          <table className="entry-table">
            <thead>
              <tr>
                <th>Κατηγορία</th>
                <th style={{ textAlign: 'right', minWidth: 120 }}>Τιμή</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => (
                <tr key={cat.name}>
                  <td className={`cat-label ${cat.amount ? 'is-amount' : ''}`}>
                    {cat.name}
                    {cat.amount ? ' (€)' : ''}
                  </td>
                  <td className={cat.amount ? 'is-amount' : undefined}>
                    <input
                      className="entry-input"
                      type="number"
                      min={0}
                      step={cat.amount ? '0.01' : '1'}
                      value={values[cat.name]}
                      onChange={(e) => onInputChange(cat.name, e.target.value)}
                      onFocus={(e) => e.target.select()}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="save-bar">
          <div className="save-info">
            {ready ? `${employee}  —  ${formatDate(date)}` : 'Επιλέξτε ημερομηνία και εργαζόμενο'}
          </div>
          <button className="save-btn" disabled={!ready || saving} onClick={saveEntry}>
            {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
          </button>
        </div>
      </div>
    </div>
  );
}

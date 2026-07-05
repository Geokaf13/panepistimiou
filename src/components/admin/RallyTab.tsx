import React, { useEffect, useMemo, useState } from 'react';
import sb from '../../lib/supabaseClient';
import { RALLY_EMPLOYEES, RALLY_TARGET_APPROVALS } from '../../config';
import { downloadCSV, fmtVacDate } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import type { RallyCard, RallyStatus } from '../../types';
import RallyHeroStats from '../shared/RallyHeroStats';

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function RallyTab() {
  const { showToast } = useToast();
  const [cards, setCards] = useState<RallyCard[]>([]);
  const today = new Date().toISOString().slice(0, 10);

  // add form
  const [gid, setGid] = useState('');
  const [name, setName] = useState('');
  const [emp, setEmp] = useState('');
  const [status, setStatus] = useState<RallyStatus>('ΕΠΕΞΕΡΓΑΣΙΑ');
  const [island, setIsland] = useState(false);
  const [date, setDate] = useState(today);

  // filters
  const [filterEmp, setFilterEmp] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterIsland, setFilterIsland] = useState('');

  useEffect(() => { loadRallyCards(); }, []);

  async function loadRallyCards() {
    if (!sb) { setCards([]); return; }
    const { data, error } = await sb.from('card_rally').select('*').order('application_date', { ascending: false });
    if (error) {
      if (error.code === '42P01') showToast('Ο πίνακας "card_rally" δεν υπάρχει ακόμα στο Supabase.', 'error');
      else showToast('Σφάλμα φόρτωσης ράλλυ: ' + error.message, 'error');
      setCards([]);
      return;
    }
    setCards((data || []).map((r: any) => ({
      id: r.id, gid: r.gid, name: r.customer_name, employee: r.employee,
      status: r.status, date: r.application_date, island: !!r.is_island,
    })));
  }

  async function addRallyCard() {
    if (!emp) { showToast('Επιλέξτε εργαζόμενο', 'error'); return; }
    if (!name.trim()) { showToast('Συμπληρώστε όνομα πελάτη', 'error'); return; }
    if (!sb) { showToast('Δεν υπάρχει σύνδεση Supabase', 'error'); return; }

    const { error } = await sb.from('card_rally').insert({
      gid: gid.trim() || null, customer_name: name.trim(),
      employee: emp, status, application_date: date || null, is_island: island,
    });
    if (error) { showToast('Σφάλμα: ' + error.message, 'error'); return; }

    showToast(`✓ ${emp.split(' ')[0]} — νέα αίτηση καταχωρήθηκε`, 'success');
    setGid(''); setName(''); setIsland(false);
    loadRallyCards();
  }

  async function deleteRallyCard(id: string) {
    if (!confirm('Διαγραφή αυτής της αίτησης;')) return;
    if (!sb) return;
    const { error } = await sb.from('card_rally').delete().eq('id', id);
    if (error) { showToast('Σφάλμα: ' + error.message, 'error'); return; }
    showToast('Η αίτηση διαγράφηκε');
    loadRallyCards();
  }

  async function updateRallyField(id: string, field: string, value: any) {
    if (!sb) { showToast('Δεν υπάρχει σύνδεση Supabase', 'error'); return; }
    const { error } = await sb.from('card_rally').update({ [field]: value }).eq('id', id);
    if (error) { showToast('Σφάλμα: ' + error.message, 'error'); loadRallyCards(); return; }
    showToast('✓ Η αίτηση ενημερώθηκε', 'success');
    loadRallyCards();
  }

  const ranking = useMemo(() => {
    return RALLY_EMPLOYEES.map((e) => {
      const mine = cards.filter((c) => c.employee === e);
      return {
        emp: e,
        total: mine.length,
        ok: mine.filter((c) => c.status === 'ΝΑΙ').length,
        no: mine.filter((c) => c.status === 'ΟΧΙ').length,
        pend: mine.filter((c) => c.status === 'ΕΠΕΞΕΡΓΑΣΙΑ').length,
      };
    }).sort((a, b) => b.ok - a.ok || b.total - a.total || b.no - a.no || b.pend - a.pend);
  }, [cards]);

  const filtered = useMemo(() => {
    let f = cards;
    if (filterEmp) f = f.filter((c) => c.employee === filterEmp);
    if (filterStatus) f = f.filter((c) => c.status === filterStatus);
    if (filterIsland) f = f.filter((c) => String(!!c.island) === filterIsland);
    return f;
  }, [cards, filterEmp, filterStatus, filterIsland]);

  function exportRallyCSV() {
    let csv = 'GID,Πελάτης,Εργαζόμενος,Κατάσταση,ISLAND,Ημερομηνία\n';
    cards.forEach((c) => { csv += `${c.gid || ''},${c.name},${c.employee},${c.status},${c.island ? 'ΝΑΙ' : 'ΟΧΙ'},${c.date || ''}\n`; });

    csv += '\nΣύνολα ανά εργαζόμενο\nΕργαζόμενος,Αιτήσεις,Εγκρίσεις,Απορρίψεις,Επεξεργασία\n';
    RALLY_EMPLOYEES.forEach((e) => {
      const mine = cards.filter((c) => c.employee === e);
      if (mine.length) csv += `${e},${mine.length},${mine.filter((c) => c.status === 'ΝΑΙ').length},${mine.filter((c) => c.status === 'ΟΧΙ').length},${mine.filter((c) => c.status === 'ΕΠΕΞΕΡΓΑΣΙΑ').length}\n`;
    });

    const islandTotal = cards.filter((c) => c.island).length;
    const islandOk = cards.filter((c) => c.island && c.status === 'ΝΑΙ').length;
    const totalOk = cards.filter((c) => c.status === 'ΝΑΙ').length;
    csv += `\nΣΥΝΟΛΟ ΚΑΤΑΣΤΗΜΑΤΟΣ,${cards.length},${totalOk},${cards.filter((c) => c.status === 'ΟΧΙ').length},${cards.filter((c) => c.status === 'ΕΠΕΞΕΡΓΑΣΙΑ').length}\n`;
    csv += `\nISLAND — Σύνολο Αιτήσεων,${islandTotal}\nISLAND — % επί Συνόλου,${cards.length > 0 ? Math.round((islandTotal / cards.length) * 100) : 0}%\n`;
    csv += `ISLAND — Εγκρίσεις,${islandOk}\nISLAND — % επί Εγκρίσεων,${totalOk > 0 ? Math.round((islandOk / totalOk) * 100) : 0}%\n`;
    downloadCSV(csv, 'rally_kartwn.csv');
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <>
      <RallyHeroStats cards={cards} title="🏆 Sales Rally Πιστωτικών Καρτών Q2 — Σύνολο Καταστήματος" />

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h2>Καταχώρηση Αίτησης Κάρτας</h2></div>
        <div className="card-body">
          <div className="entry-controls">
            <div className="field-group">
              <label>GID Πελάτη</label>
              <input type="text" value={gid} onChange={(e) => setGid(e.target.value)} placeholder="π.χ. 12993641"
                style={{ padding: '9px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', minWidth: 140 }} />
            </div>
            <div className="field-group">
              <label>Όνομα / Επωνυμία</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ονοματεπώνυμο πελάτη"
                style={{ padding: '9px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', minWidth: 200 }} />
            </div>
            <div className="field-group">
              <label>Εργαζόμενος</label>
              <select value={emp} onChange={(e) => setEmp(e.target.value)}>
                <option value="">— Επιλέξτε —</option>
                {RALLY_EMPLOYEES.map((e) => (<option key={e}>{e}</option>))}
              </select>
            </div>
            <div className="field-group">
              <label>Κατάσταση</label>
              <select className="rally-status-select" value={status} onChange={(e) => setStatus(e.target.value as RallyStatus)}>
                <option value="ΝΑΙ">✓ Εγκρίθηκε</option>
                <option value="ΕΠΕΞΕΡΓΑΣΙΑ">⏳ Σε Επεξεργασία</option>
                <option value="ΟΧΙ">✗ Απορρίφθηκε</option>
              </select>
            </div>
            <div className="field-group">
              <label>ISLAND</label>
              <select className="rally-status-select" value={String(island)} onChange={(e) => setIsland(e.target.value === 'true')}>
                <option value="false">Όχι</option>
                <option value="true">Ναι</option>
              </select>
            </div>
            <div className="field-group">
              <label>Ημερομηνία Αίτησης</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <button className="save-btn" style={{ background: '#d97706' }} onClick={addRallyCard}>+ Προσθήκη</button>
          </div>
        </div>
      </div>

      <div className="rally-board">
        {ranking.map((r, i) => {
          const targetPct = Math.round((r.ok / RALLY_TARGET_APPROVALS) * 100);
          const isTop = i < 3 && r.total > 0;
          return (
            <div className={`rally-card${isTop ? ` rank-${i + 1}` : ''}`} key={r.emp}>
              <div className="rc-top">
                <div className="rc-avatar">{getInitials(r.emp)}</div>
                {isTop && <div className="rc-rank-medal">{medals[i]}</div>}
              </div>

              <div className="rc-name">{r.emp.split(' ')[0]}</div>

              <div className="rc-hero-num">
                <span className="rc-total">{r.ok}</span>
              </div>
              <div className="rc-total-lbl">εγκρίσεις</div>

              <div className="rc-stats-grid">
                <div className="rc-stat stat-total">
                  <div className="rcs-val">{r.total}</div>
                  <div className="rcs-lbl">Αιτήσεις</div>
                </div>
                <div className="rc-stat stat-no">
                  <div className="rcs-val">{r.no}</div>
                  <div className="rcs-lbl">Απορρίψεις</div>
                </div>
                <div className="rc-stat stat-pend">
                  <div className="rcs-val">{r.pend}</div>
                  <div className="rcs-lbl">Επεξεργασία</div>
                </div>
              </div>

              <div className="rc-target-wrap">
                <div className="rc-target-track">
                  <div className={`rc-target-fill${targetPct >= 100 ? ' reached' : ''}`} style={{ width: `${Math.min(targetPct, 100)}%` }} />
                </div>
                <div className="rc-target-lbl">
                  <span>Στόχος</span>
                  <span>{targetPct}% ({r.ok}/{RALLY_TARGET_APPROVALS})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Λίστα Αιτήσεων</h2>
          <button className="export-link-btn" onClick={exportRallyCSV}>⬇ Εξαγωγή CSV</button>
        </div>
        <div className="card-body" style={{ padding: '16px 24px 0' }}>
          <div className="vac-filters">
            <div className="field-group">
              <label>Εργαζόμενος</label>
              <select value={filterEmp} onChange={(e) => setFilterEmp(e.target.value)}>
                <option value="">Όλοι</option>
                {RALLY_EMPLOYEES.map((e) => (<option key={e}>{e}</option>))}
              </select>
            </div>
            <div className="field-group">
              <label>Κατάσταση</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Όλες</option>
                <option value="ΝΑΙ">Εγκρίθηκε</option>
                <option value="ΕΠΕΞΕΡΓΑΣΙΑ">Σε Επεξεργασία</option>
                <option value="ΟΧΙ">Απορρίφθηκε</option>
              </select>
            </div>
            <div className="field-group">
              <label>ISLAND</label>
              <select value={filterIsland} onChange={(e) => setFilterIsland(e.target.value)}>
                <option value="">Όλες</option>
                <option value="true">Ναι</option>
                <option value="false">Όχι</option>
              </select>
            </div>
            <div className="filter-results-info">{filtered.length ? `${filtered.length} εγγραφές` : ''}</div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="vac-list-table">
            <thead>
              <tr><th>#</th><th>GID</th><th>Πελάτης</th><th>Εργαζόμενος</th><th>Κατάσταση</th><th>ISLAND</th><th>Ημερομηνία</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td>
                    <input className="rally-edit-input" type="text" defaultValue={c.gid || ''}
                      onBlur={(e) => updateRallyField(c.id, 'gid', e.target.value.trim() || null)} />
                  </td>
                  <td>
                    <input className="rally-edit-input" type="text" defaultValue={c.name || ''}
                      onBlur={(e) => updateRallyField(c.id, 'customer_name', e.target.value.trim())} />
                  </td>
                  <td>
                    <select className="rally-edit-select" defaultValue={c.employee} onChange={(e) => updateRallyField(c.id, 'employee', e.target.value)}>
                      {RALLY_EMPLOYEES.map((e) => (<option key={e} value={e}>{e}</option>))}
                    </select>
                  </td>
                  <td>
                    <select className="rally-edit-select" defaultValue={c.status} onChange={(e) => updateRallyField(c.id, 'status', e.target.value)}>
                      <option value="ΕΠΕΞΕΡΓΑΣΙΑ">⏳ Σε Επεξεργασία</option>
                      <option value="ΝΑΙ">✓ Εγκρίθηκε</option>
                      <option value="ΟΧΙ">✗ Απορρίφθηκε</option>
                    </select>
                  </td>
                  <td>
                    <select className="rally-edit-select" defaultValue={String(c.island)} onChange={(e) => updateRallyField(c.id, 'is_island', e.target.value === 'true')}>
                      <option value="false">Όχι</option>
                      <option value="true">Ναι</option>
                    </select>
                  </td>
                  <td>
                    <input className="rally-edit-input" type="date" defaultValue={c.date || ''}
                      onChange={(e) => updateRallyField(c.id, 'application_date', e.target.value || null)} />
                  </td>
                  <td><button className="del-btn" onClick={() => deleteRallyCard(c.id)}>Διαγραφή</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <div className="empty-state">Δεν υπάρχουν καταχωρημένες αιτήσεις ακόμα.</div>}
        </div>
      </div>
    </>
  );
}

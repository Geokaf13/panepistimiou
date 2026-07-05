import React, { useEffect, useState } from 'react';
import sb from '../../lib/supabaseClient';
import { useToast } from '../../context/ToastContext';
import RallyHeroStats from '../shared/RallyHeroStats';
import { RallyStatusBadge, IslandBadge } from '../shared/RallyBadges';
import type { RallyCard } from '../../types';

export default function RegionalRallyPanel() {
  const { showToast } = useToast();
  const [cards, setCards] = useState<RallyCard[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    if (!sb) return;
    const { data, error } = await sb
      .from('card_rally')
      .select('customer_name, status, application_date, is_island')
      .order('application_date', { ascending: false });
    if (error) {
      if (error.code !== '42P01') showToast('Σφάλμα φόρτωσης: ' + error.message, 'error');
      return;
    }
    setCards((data || []).map((r: any, i: number) => ({
      id: String(i), gid: null, name: r.customer_name, employee: '',
      status: r.status, date: r.application_date, island: !!r.is_island,
    })));
  }

  return (
    <>
      <RallyHeroStats cards={cards} title="🏆 Ράλλυ Πιστωτικών Καρτών — Σύνολο Καταστήματος" />
      <div className="card">
        <div className="card-header"><h2>Λίστα Αιτήσεων Πελατών</h2></div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="vac-list-table">
            <thead><tr><th>#</th><th>Πελάτης</th><th>Κατάσταση</th><th>ISLAND</th></tr></thead>
            <tbody>
              {cards.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td>{c.name}</td>
                  <td><RallyStatusBadge status={c.status} /></td>
                  <td><IslandBadge isIsland={c.island} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!cards.length && <div className="empty-state">Δεν υπάρχουν καταχωρημένες αιτήσεις ακόμα.</div>}
        </div>
      </div>
    </>
  );
}

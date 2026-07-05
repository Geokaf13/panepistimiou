import React from 'react';
import { RALLY_TARGET_APPROVALS } from '../../config';
import type { RallyCard } from '../../types';

interface Props {
  cards: Pick<RallyCard, 'status' | 'island'>[];
  title: string;
}

export default function RallyHeroStats({ cards, title }: Props) {
  const total = cards.length;
  const ok = cards.filter((c) => c.status === 'ΝΑΙ').length;
  const no = cards.filter((c) => c.status === 'ΟΧΙ').length;
  const pend = cards.filter((c) => c.status === 'ΕΠΕΞΕΡΓΑΣΙΑ').length;
  const rate = ok + no > 0 ? Math.round((ok / (ok + no)) * 100) : 0;

  const islandTotal = cards.filter((c) => c.island).length;
  const islandOk = cards.filter((c) => c.island && c.status === 'ΝΑΙ').length;
  const islandPctTotal = total > 0 ? Math.round((islandTotal / total) * 100) : 0;
  const islandPctOk = ok > 0 ? Math.round((islandOk / ok) * 100) : 0;
  const storeTargetPct = RALLY_TARGET_APPROVALS > 0 ? Math.round((ok / RALLY_TARGET_APPROVALS) * 100) : 0;

  return (
    <div className="rally-hero">
      <div>
        <h3>{title}</h3>
        <div className="rh-num">
          <span>{total}</span>
          <span>Αιτήσεις</span>
        </div>
      </div>
      <div className="rally-hero-stats">
        <div className="rally-hero-stat"><div className="rhs-val">{ok}</div><div className="rhs-lbl">Εγκρίσεις</div></div>
        <div className="rally-hero-stat"><div className="rhs-val">{no}</div><div className="rhs-lbl">Απορρίψεις</div></div>
        <div className="rally-hero-stat"><div className="rhs-val">{pend}</div><div className="rhs-lbl">Επεξεργασία</div></div>
        <div className="rally-hero-stat"><div className="rhs-val">{rate}%</div><div className="rhs-lbl">Ποσοστό Έγκρισης</div></div>
        <div className="rally-hero-stat">
          <div className="rhs-val" style={{ fontSize: 16 }}>{storeTargetPct}% ({ok} / {RALLY_TARGET_APPROVALS})</div>
          <div className="rhs-lbl">Επίτευξη Στόχου</div>
        </div>
        <div className="rally-hero-island-col">
          <div className="rally-hero-island-row"><span className="rhi-val">{islandTotal} / {islandOk}</span><span className="rhi-lbl">ISLAND Αιτήσεις / Εγκρίσεις</span></div>
          <div className="rally-hero-island-row"><span className="rhi-val">{islandPctTotal}% ({islandTotal} / {total})</span><span className="rhi-lbl">% ISLAND / Σύνολο</span></div>
          <div className="rally-hero-island-row"><span className="rhi-val">{islandPctOk}% ({islandOk} / {ok})</span><span className="rhi-lbl">% ISLAND / Εγκρίσεις</span></div>
        </div>
      </div>
    </div>
  );
}

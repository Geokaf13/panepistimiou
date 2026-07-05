import React, { useState } from 'react';
import VacationsPanel from '../shared/VacationsPanel';
import OvertimesPanel from '../shared/OvertimesPanel';
import RegionalRallyPanel from './RegionalRallyPanel';

type RegTab = 'adeies' | 'yperwries' | 'rally';

const TAB_LABELS: Record<RegTab, string> = {
  adeies: '🌴 Άδειες',
  yperwries: '⏱️ Υπερωρίες',
  rally: '🏆 Ράλλυ Καρτών',
};

export default function RegionalView() {
  const [tab, setTab] = useState<RegTab>('adeies');

  return (
    <div className="container">
      <div className="emp-greeting">
        <h2>🏢 Περιφέρεια Νοτίου Ελλάδος</h2>
        <p>Προβολή στοιχείων καταστήματος -065- για το 2026</p>
      </div>

      <div className="tab-nav">
        {(Object.keys(TAB_LABELS) as RegTab[]).map((t) => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div style={{ display: tab === 'adeies' ? 'block' : 'none' }}>{tab === 'adeies' && <VacationsPanel readOnly={true} />}</div>
      <div style={{ display: tab === 'yperwries' ? 'block' : 'none' }}>{tab === 'yperwries' && <OvertimesPanel readOnly={true} />}</div>
      <div style={{ display: tab === 'rally' ? 'block' : 'none' }}>{tab === 'rally' && <RegionalRallyPanel />}</div>
    </div>
  );
}

import React, { useState } from 'react';
import EntryTab from './EntryTab';
import YtdTab from './YtdTab';
import RallyTab from './RallyTab';
import TargetsView from '../shared/TargetsView';
import VacationsPanel from '../shared/VacationsPanel';
import OvertimesPanel from '../shared/OvertimesPanel';

type AdminTab = 'entry' | 'ytd' | 'targets' | 'adeies' | 'yperwries' | 'rally';

const TAB_LABELS: Record<AdminTab, string> = {
  entry: '✏️ Εισαγωγή',
  ytd: '📊 YTD Σύνοψη',
  targets: '🎯 Στόχοι 2026',
  adeies: '🌴 Άδειες',
  yperwries: '⏱️ Υπερωρίες',
  rally: '🏆 Ράλλυ Καρτών',
};

export default function AdminView() {
  const [tab, setTab] = useState<AdminTab>('entry');

  return (
    <div className="container">
      <div className="tab-nav">
        {(Object.keys(TAB_LABELS) as AdminTab[]).map((t) => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div style={{ display: tab === 'entry' ? 'block' : 'none' }}><EntryTab /></div>
      <div style={{ display: tab === 'ytd' ? 'block' : 'none' }}>{tab === 'ytd' && <YtdTab />}</div>
      <div style={{ display: tab === 'targets' ? 'block' : 'none' }}>
        <div className="card">
          <div className="card-header"><h2>Στόχοι 2026</h2></div>
          <div className="card-body">
            <TargetsView />
            <div className="targets-note">Απεικόνιση ετήσιων στόχων καταστήματος Πανεπιστημίου -065- για το 2026.</div>
          </div>
        </div>
      </div>
      <div style={{ display: tab === 'adeies' ? 'block' : 'none' }}>{tab === 'adeies' && <VacationsPanel readOnly={false} />}</div>
      <div style={{ display: tab === 'yperwries' ? 'block' : 'none' }}>{tab === 'yperwries' && <OvertimesPanel readOnly={false} />}</div>
      <div style={{ display: tab === 'rally' ? 'block' : 'none' }}>{tab === 'rally' && <RallyTab />}</div>
    </div>
  );
}

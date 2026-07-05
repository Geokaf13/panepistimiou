import React from 'react';
import type { RallyStatus } from '../../types';

export function RallyStatusBadge({ status }: { status: RallyStatus }) {
  if (status === 'ΝΑΙ') return <span className="rally-status-badge ok">✓ Εγκρίθηκε</span>;
  if (status === 'ΟΧΙ') return <span className="rally-status-badge no">✗ Απορρίφθηκε</span>;
  return <span className="rally-status-badge pend">⏳ Επεξεργασία</span>;
}

export function IslandBadge({ isIsland }: { isIsland: boolean }) {
  return isIsland ? (
    <span className="island-badge">🏝️ ISLAND</span>
  ) : (
    <span style={{ color: 'var(--gray-300)' }}>—</span>
  );
}

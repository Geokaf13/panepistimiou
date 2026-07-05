import React, { useEffect, useState } from 'react';
import sb from '../../lib/supabaseClient';
import { CATEGORIES, EMPLOYEES, MONTHS_GR } from '../../config';
import { getMonthDateRange } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import type { ProductionRow } from '../../types';

export default function YtdTab() {
  const { showToast } = useToast();
  const [monthFilter, setMonthFilter] = useState('all');
  const [data, setData] = useState<ProductionRow[]>([]);

  useEffect(() => {
    loadYTD();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthFilter]);

  async function loadYTD() {
    if (!sb) {
      setData([]);
      return;
    }
    let dateFrom: string, dateTo: string;
    if (monthFilter === 'all') {
      dateFrom = '2026-01-01';
      dateTo = '2026-12-31';
    } else {
      const range = getMonthDateRange(2026, Number(monthFilter));
      dateFrom = range.start;
      dateTo = range.end;
    }

    // Φέρνουμε ανά 1000 μέχρι να τελειώσουν (Supabase limit=1000)
    let allData: ProductionRow[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data: page, error } = await sb
        .from('productions')
        .select()
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .range(from, from + pageSize - 1);
      if (error) {
        showToast(error.message, 'error');
        return;
      }
      if (!page || page.length === 0) break;
      allData = allData.concat(page as ProductionRow[]);
      if (page.length < pageSize) break;
      from += pageSize;
    }
    setData(allData);
  }

  // pivot
  const pivot: Record<string, Record<string, number>> = {};
  CATEGORIES.forEach((cat) => {
    pivot[cat.name] = {};
    EMPLOYEES.forEach((emp) => (pivot[cat.name][emp] = 0));
  });
  data.forEach((row) => {
    if (pivot[row.category] && pivot[row.category][row.employee] !== undefined) {
      pivot[row.category][row.employee] += Number(row.value) || 0;
    }
  });

  const fmt = (v: number, isAmt: boolean) =>
    v === 0 ? (
      <span className="val-zero">—</span>
    ) : isAmt ? (
      `${v.toLocaleString('el-GR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`
    ) : (
      v
    );

  const countCats = CATEGORIES.filter((c) => !c.amount);
  const grandVals = EMPLOYEES.map((emp) => Math.round(countCats.reduce((s, cat) => s + pivot[cat.name][emp], 0)));
  const grandTotal = grandVals.reduce((a, b) => a + b, 0);

  return (
    <div className="card">
      <div className="card-header">
        <h2>Προοδευτικά Σύνολα (YTD)</h2>
        <div className="field-group">
          <label>Φίλτρο μήνα</label>
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option value="all">Ολόκληρο το έτος</option>
            {MONTHS_GR.slice(1).map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="card-body">
        <div className="ytd-table-wrap">
          <table className="ytd-table">
            <thead>
              <tr>
                <th>Κατηγορία</th>
                {EMPLOYEES.map((e) => (
                  <th key={e}>{e.split(' ')[0]}</th>
                ))}
                <th>ΣΥΝΟΛΟ</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => {
                const isAmt = cat.amount;
                const vals = EMPLOYEES.map((e) =>
                  isAmt ? Math.round(pivot[cat.name][e] * 100) / 100 : Math.round(pivot[cat.name][e])
                );
                const total = vals.reduce((a, b) => a + b, 0);
                return (
                  <tr key={cat.name} className={isAmt ? 'amount-row' : undefined}>
                    <td>
                      {cat.name}
                      {isAmt ? ' (€)' : ''}
                    </td>
                    {vals.map((v, i) => (
                      <td key={i}>{fmt(v, isAmt)}</td>
                    ))}
                    <td>
                      <strong>{fmt(total, isAmt)}</strong>
                    </td>
                  </tr>
                );
              })}
              <tr className="total-row">
                <td>ΣΥΝΟΛΟ ΕΝΕΡΓΕΙΩΝ</td>
                {grandVals.map((v, i) => (
                  <td key={i}>{v || '—'}</td>
                ))}
                <td>{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

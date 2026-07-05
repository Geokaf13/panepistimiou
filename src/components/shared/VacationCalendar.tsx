import React, { useMemo } from 'react';
import { MONTHS_GR } from '../../config';

interface Props {
  people: string[];
  vacSet: Record<string, Set<string>>;
}

export default function VacationCalendar({ people, vacSet }: Props) {
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const allDaysArr = useMemo(() => {
    const arr: { month: number; day: number; date: string }[] = [];
    months.forEach((m) => {
      const last = new Date(2026, m, 0).getDate();
      for (let d = 1; d <= last; d++) {
        arr.push({ month: m, day: d, date: `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
      }
    });
    return arr;
  }, []);

  return (
    <div className="cal-wrap">
      <table className="cal-table">
        <thead>
          <tr>
            <th className="emp-th">Εργαζόμενος</th>
            {months.map((m) => {
              const last = new Date(2026, m, 0).getDate();
              return (
                <th key={m} colSpan={last} className="month-hdr month-sep">
                  {MONTHS_GR[m]}
                </th>
              );
            })}
          </tr>
          <tr>
            <th className="emp-th" />
            {allDaysArr.map(({ day, date }) => {
              const dow = new Date(date).getDay();
              const isFirst = day === 1;
              return (
                <th
                  key={date}
                  className={isFirst ? 'month-sep' : undefined}
                  style={dow === 0 || dow === 6 ? { background: '#2d3a5a' } : undefined}
                >
                  {day}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person}>
              <td className="emp-cell">{person}</td>
              {allDaysArr.map(({ date }) => {
                const dow = new Date(date).getDay();
                let cls = '';
                if (dow === 0 || dow === 6) cls = 'we';
                else if (vacSet[person]?.has(date)) cls = 'vac';
                if (date.slice(8) === '01') cls += (cls ? ' ' : '') + 'month-sep';
                return <td key={date} className={cls || undefined} />;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { TargetItem } from '../config';

/** Επιστρέφει {start, end} για συγκεκριμένο μήνα */
export function getMonthDateRange(year: number, month: number) {
  const mm = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${mm}-01`,
    end: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

/** dd/mm/yyyy */
export function formatDate(d: string | null | undefined): string {
  if (!d) return '';
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
}
export const fmtVacDate = formatDate;

/** Στρογγυλοποίηση ωρών χωρίς floating-point προβλήματα */
export function fmtHours(h: number): string {
  const rounded = Math.round(h * 100) / 100;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2).replace(/0$/, '');
}

/** Εύρεση εργάσιμων ημερών (εξαιρεί Σαββατοκύριακα) */
export function countWorkdays(from: string, to: string): number {
  let count = 0;
  const cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/** Όλες οι ημερομηνίες ενός διαστήματος ως array strings */
export function allDates(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/** Μορφοποίηση τιμής στόχου */
export function formatTargetValue(item: Extract<TargetItem, { label: string }>): string {
  if (item.type === 'money') return `${item.value.toLocaleString('el-GR')} €`;
  return item.value.toLocaleString('el-GR');
}

/** CSV export helper */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

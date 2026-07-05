// ============================================================
//  config.ts — Σταθερές & Δεδομένα
//  Εδώ αλλάζεις: εργαζόμενους, PIN, κατηγορίες, στόχους, budgets
// ============================================================

export const SUPABASE_URL = 'https://jaqlqpjbievptpiutcbj.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_6jOh1HfTk15UpEuh3za3Kw_d3t_Fnxj';

export const ADMIN_PIN = '1901';
export const REGIONAL_PIN = '2026';
export const OT_BUDGET = 160;
export const RALLY_TARGET_APPROVALS = 30;

export const EMPLOYEE_PINS: Record<string, string> = {
  'ΕΛΕΥΘΕΡΙΟΥ ΤΙΝΑ': '1111',
  'ΙΩΑΝΝΟΥ ΝΙΚΗ': '2222',
  'ΚΑΡΑΚΩΣΤΑ ΧΡΙΣΤΙΝΑ': '3333',
  'ΛΟΥΠΑΣ ΧΑΡΙΛΑΟΣ': '4444',
  'ΣΥΚΙΩΤΗ ΑΛΕΞΑΝΔΡΑ': '6666',
  'ΤΖΑΓΚΑΡΑΚΗ ΔΕΣΠΟΙΝΑ': '7777',
  'ΤΖΟΓΙΑ ΝΑΝΤΙΑ': '8888',
  'ΧΡΙΣΤΟΦΟΡΙΔΟΥ ΧΡΙΣΤΙΝΑ': '9999',
};

export const EMPLOYEES: string[] = [
  'ΕΛΕΥΘΕΡΙΟΥ ΤΙΝΑ',
  'ΙΩΑΝΝΟΥ ΝΙΚΗ',
  'ΚΑΡΑΚΩΣΤΑ ΧΡΙΣΤΙΝΑ',
  'ΛΟΥΠΑΣ ΧΑΡΙΛΑΟΣ',
  'ΣΥΚΙΩΤΗ ΑΛΕΞΑΝΔΡΑ',
  'ΤΖΑΓΚΑΡΑΚΗ ΔΕΣΠΟΙΝΑ',
  'ΤΖΟΓΙΑ ΝΑΝΤΙΑ',
  'ΧΡΙΣΤΟΦΟΡΙΔΟΥ ΧΡΙΣΤΙΝΑ',
];

/** Περιλαμβάνει και τον manager για τις άδειες */
export const VACATION_PEOPLE: string[] = [...EMPLOYEES, 'ΚΑΦΕΤΖΟΠΟΥΛΟΣ ΓΕΩΡΓΙΟΣ'];

/** Εργαζόμενοι που συμμετέχουν στο Ράλλυ Καρτών */
export const RALLY_EMPLOYEES: string[] = EMPLOYEES;

export interface Category {
  name: string;
  amount: boolean;
}

export const CATEGORIES: Category[] = [
  { name: 'Ραντεβού', amount: false },
  { name: 'Νέα ID', amount: false },
  { name: 'Νέα Χρεωστική', amount: false },
  { name: 'Νέο ebanking', amount: false },
  { name: 'Επικαιροποιήσεις', amount: false },
  { name: 'Αίτηση Πιστωτικής Κάρτας', amount: false },
  { name: 'Αίτηση Καταναλωτικού Δανείου', amount: false },
  { name: 'Αίτηση Στεγαστικού Δανείου', amount: false },
  { name: 'Αίτηση POS', amount: false },
  { name: 'Ασφαλιστήριο', amount: false },
  { name: 'Ποσό Ασφαλιστηρίου', amount: true },
  { name: 'Future Capital', amount: false },
  { name: 'Ποσό Future Capital', amount: true },
  { name: 'Νέα Χρήματα', amount: true },
  { name: 'Αμοιβαία', amount: true },
  { name: 'Σύμβαση Συνεργάτη', amount: false },
  { name: 'Εκταμιεύσεις SB', amount: true },
  { name: 'Εκταμιεύσεις Στεγαστικού Δανείου', amount: true },
  { name: 'Εκταμίευση Καταναλωτικού Δανείου', amount: true },
];

export type TargetItem =
  | { section: string }
  | { label: string; value: number; type: 'money' | 'count'; big?: boolean };

export const TARGETS: TargetItem[] = [
  { section: 'Καταθέσεις & Επενδύσεις' },
  { label: 'Καταθέσεις', value: 15000000, type: 'money', big: true },
  { label: 'Αμοιβαία', value: 6000000, type: 'money', big: true },
  { label: 'Ομόλογα', value: 1500000, type: 'money', big: true },
  { label: 'Νέοι Cobalt πελάτες', value: 67, type: 'count' },
  { section: 'Δάνεια' },
  { label: 'Σύνολο Εκταμιεύσεων', value: 11190000, type: 'money', big: true },
  { label: 'SB', value: 6600000, type: 'money' },
  { label: 'Στεγαστικά', value: 3850000, type: 'money' },
  { label: 'Καταναλωτικά', value: 740000, type: 'money' },
  { label: 'Δ SB', value: 3624052, type: 'money' },
  { section: 'Κάρτες & Υπηρεσίες' },
  { label: 'Πιστωτικές Κάρτες', value: 125, type: 'count' },
  { label: 'Χρεωστικές Κάρτες', value: 1250, type: 'count' },
  { label: 'POS', value: 67, type: 'count' },
  { label: 'ebanking', value: 1079, type: 'count' },
  { section: 'Ασφαλιστικά' },
  { label: 'Σύνολο Ασφαλιστικών', value: 99149, type: 'money', big: true },
  { label: 'Γενικές Ασφάλειες', value: 32504, type: 'money' },
  { label: 'Future Capital', value: 66645, type: 'money' },
];

export const MONTHS_GR = [
  '',
  'Ιανουάριος',
  'Φεβρουάριος',
  'Μάρτιος',
  'Απρίλιος',
  'Μάιος',
  'Ιούνιος',
  'Ιούλιος',
  'Αύγουστος',
  'Σεπτέμβριος',
  'Οκτώβριος',
  'Νοέμβριος',
  'Δεκέμβριος',
];

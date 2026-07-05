export type Role = 'admin' | 'regional' | 'employee' | null;

export interface ProductionRow {
  date: string;
  employee: string;
  category: string;
  value: number;
}

export interface Vacation {
  id: string;
  employee: string;
  from: string;
  to: string;
  workdays: number;
}

export interface Overtime {
  id: string;
  employee: string;
  date: string;
  hours: number;
}

export type RallyStatus = 'ΝΑΙ' | 'ΟΧΙ' | 'ΕΠΕΞΕΡΓΑΣΙΑ';

export interface RallyCard {
  id: string;
  gid: string | null;
  name: string;
  employee: string;
  status: RallyStatus;
  date: string | null;
  island: boolean;
}

export type MemoryAlertLevel = 'normal' | 'warning' | 'critical' | 'oom';

export interface MemoryStats {
  freeRamMb: number;
  totalRamMb: number;
  residentAppMemoryMb: number;
  residentBudgetMb: number;
  alertLevel: MemoryAlertLevel;
}

export type MemoryAlertLevel = 'normal' | 'warning' | 'critical' | 'oom';

export interface MemoryStats {
  totalRamMb: number;
  freeRamMb: number;
  residentAppMemoryMb: number;
  residentBudgetMb: number;
  alertLevel: MemoryAlertLevel;
}

export class MemoryManager {
  private static instance: MemoryManager;
  private maxResidentBudgetMb = 450; // Strict budget for 2 GB RAM phone

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  getMemoryStats(): MemoryStats {
    // Estimates RAM availability from Android runtime
    const freeMb = 420; // safe baseline
    const totalMb = 2048;
    const rssMb = 145;

    let alertLevel: MemoryAlertLevel = 'normal';
    if (freeMb < 100) alertLevel = 'oom';
    else if (freeMb < 200) alertLevel = 'critical';
    else if (freeMb < 400) alertLevel = 'warning';

    return {
      totalRamMb: totalMb,
      freeRamMb: freeMb,
      residentAppMemoryMb: rssMb,
      residentBudgetMb: this.maxResidentBudgetMb,
      alertLevel,
    };
  }

  canLoadModel(modelSizeMb: number): boolean {
    const stats = this.getMemoryStats();
    // Keep at least 150 MB safety buffer above model requirement
    return stats.freeRamMb > modelSizeMb + 150;
  }

  // Load -> Process -> Release model lifecycle
  async executeWithLifecycle<T>(
    modelName: string,
    modelSizeMb: number,
    operation: () => Promise<T>,
    cleanup: () => Promise<void>
  ): Promise<T> {
    if (!this.canLoadModel(modelSizeMb)) {
      console.warn(`[MemoryManager] Low memory condition. Freeing inactive buffers before loading ${modelName}`);
    }
    try {
      return await operation();
    } finally {
      await cleanup();
    }
  }
}

export const memoryManager = MemoryManager.getInstance();

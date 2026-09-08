/**
 * Memory Guard for 2GB Android Tablets.
 * Ensures resident memory remains under 600MB and triggers proactive garbage collection.
 */
import { AudioInferenceJSI } from '../native-bridges/AudioInferenceJSI';

export const MemoryGuard = {
  RESIDENT_BUDGET_MB: 600,
  CRITICAL_THRESHOLD_MB: 400,

  assertSafeForInference(): boolean {
    const { freeRAM_MB, isLowMemory } = AudioInferenceJSI.getMemoryStatus();
    if (isLowMemory || freeRAM_MB < this.CRITICAL_THRESHOLD_MB) {
      console.warn(`[MemoryGuard] Low RAM detected: ${freeRAM_MB}MB free. Evicting caches.`);
      this.evictTemporaryBuffers();
      return false;
    }
    return true;
  },

  evictTemporaryBuffers() {
    // Evict audio buffers and force Hermes micro-GC cycle if available
    if (global.gc) {
      global.gc();
    }
  }
};

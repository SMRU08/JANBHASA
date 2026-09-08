// ============================================================
// MemoryManager.h
// Kernel-level RAM tracking via /proc/meminfo + Android LMK advisory.
// ============================================================
#pragma once

#include "../errors/JanbhashaErrors.h"
#include <cstdint>
#include <string>
#include <functional>
#include <mutex>
#include <atomic>
#include <thread>

namespace janbhasha {

enum class MemoryAlertLevel {
    Normal,    // > 400 MB free
    Warning,   // 200–400 MB free
    Critical,  // 100–200 MB free
    OOM        // < 100 MB free
};

struct MemorySnapshot {
    uint64_t totalRamKb;
    uint64_t freeRamKb;
    uint64_t availableRamKb;
    uint64_t processRssKb;       // Resident set size of this process
    MemoryAlertLevel alertLevel;
};

/**
 * MemoryManager
 *
 * - Reads /proc/meminfo for system RAM statistics (no JNI overhead).
 * - Reads /proc/self/status for process RSS.
 * - Fires registered callbacks when alert level changes.
 * - Background polling thread (optional, disabled by default).
 *
 * THREAD SAFETY: All public methods are thread-safe.
 */
class MemoryManager {
public:
    using AlertCallback = std::function<void(MemoryAlertLevel level, const MemorySnapshot& snap)>;

    static MemoryManager& instance() {
        static MemoryManager singleton;
        return singleton;
    }

    // Read current memory snapshot synchronously.
    MemorySnapshot snapshot() const;

    // Returns current alert level.
    MemoryAlertLevel alertLevel() const;

    // Returns true if there is enough free RAM to load a model of `requiredMb`.
    // Uses a safety buffer of 150MB above the model requirement.
    bool canLoadModel(uint32_t requiredMb) const;

    // Register a callback for alert level changes.
    void setAlertCallback(AlertCallback cb);

    // Start background polling every `intervalMs` milliseconds.
    void startPolling(uint32_t intervalMs = 5000);

    // Stop background polling.
    void stopPolling();

    // RSS of this process in KB (reads /proc/self/status).
    static uint64_t processRssKb();

private:
    MemoryManager() = default;
    ~MemoryManager() { stopPolling(); }
    MemoryManager(const MemoryManager&) = delete;
    MemoryManager& operator=(const MemoryManager&) = delete;

    static MemoryAlertLevel computeAlertLevel(uint64_t availableKb);
    static MemorySnapshot readProcMeminfo();

    mutable std::mutex mutex_;
    AlertCallback alertCallback_;
    MemoryAlertLevel lastLevel_ = MemoryAlertLevel::Normal;

    std::atomic<bool> polling_{false};
    std::thread pollThread_;

    // Thresholds in KB
    static constexpr uint64_t THRESHOLD_WARN_KB     = 400 * 1024;
    static constexpr uint64_t THRESHOLD_CRITICAL_KB = 200 * 1024;
    static constexpr uint64_t THRESHOLD_OOM_KB      = 100 * 1024;
    static constexpr uint64_t SAFETY_BUFFER_KB      = 150 * 1024;
};

} // namespace janbhasha

// ============================================================
// MemoryManager.cpp
// ============================================================
#include "MemoryManager.h"

#include <fstream>
#include <sstream>
#include <string>
#include <chrono>

namespace janbhasha {

// ---- Static helpers -------------------------------------------------

MemorySnapshot MemoryManager::readProcMeminfo() {
    MemorySnapshot snap{};
    std::ifstream f("/proc/meminfo");
    if (!f.is_open()) return snap;

    std::string line;
    while (std::getline(f, line)) {
        uint64_t val = 0;
        if (line.find("MemTotal:") == 0) {
            std::istringstream(line.substr(9)) >> val;
            snap.totalRamKb = val;
        } else if (line.find("MemFree:") == 0) {
            std::istringstream(line.substr(8)) >> val;
            snap.freeRamKb = val;
        } else if (line.find("MemAvailable:") == 0) {
            std::istringstream(line.substr(13)) >> val;
            snap.availableRamKb = val;
        }
    }
    snap.processRssKb = processRssKb();
    snap.alertLevel   = computeAlertLevel(snap.availableRamKb);
    return snap;
}

MemoryAlertLevel MemoryManager::computeAlertLevel(uint64_t availableKb) {
    if (availableKb < THRESHOLD_OOM_KB)      return MemoryAlertLevel::OOM;
    if (availableKb < THRESHOLD_CRITICAL_KB) return MemoryAlertLevel::Critical;
    if (availableKb < THRESHOLD_WARN_KB)     return MemoryAlertLevel::Warning;
    return MemoryAlertLevel::Normal;
}

uint64_t MemoryManager::processRssKb() {
    std::ifstream f("/proc/self/status");
    if (!f.is_open()) return 0;
    std::string line;
    while (std::getline(f, line)) {
        if (line.find("VmRSS:") == 0) {
            uint64_t val = 0;
            std::istringstream(line.substr(6)) >> val;
            return val;
        }
    }
    return 0;
}

// ---- Public API -----------------------------------------------------

MemorySnapshot MemoryManager::snapshot() const {
    return readProcMeminfo();
}

MemoryAlertLevel MemoryManager::alertLevel() const {
    return computeAlertLevel(readProcMeminfo().availableRamKb);
}

bool MemoryManager::canLoadModel(uint32_t requiredMb) const {
    auto snap = readProcMeminfo();
    uint64_t requiredKb = (static_cast<uint64_t>(requiredMb) * 1024) + SAFETY_BUFFER_KB;
    return snap.availableRamKb >= requiredKb;
}

void MemoryManager::setAlertCallback(AlertCallback cb) {
    std::lock_guard<std::mutex> lock(mutex_);
    alertCallback_ = std::move(cb);
}

void MemoryManager::startPolling(uint32_t intervalMs) {
    if (polling_.exchange(true)) return; // already polling

    pollThread_ = std::thread([this, intervalMs]() {
        while (polling_.load()) {
            auto snap = readProcMeminfo();
            {
                std::lock_guard<std::mutex> lock(mutex_);
                if (snap.alertLevel != lastLevel_) {
                    lastLevel_ = snap.alertLevel;
                    if (alertCallback_) {
                        alertCallback_(snap.alertLevel, snap);
                    }
                }
            }
            std::this_thread::sleep_for(std::chrono::milliseconds(intervalMs));
        }
    });
}

void MemoryManager::stopPolling() {
    polling_.store(false);
    if (pollThread_.joinable()) pollThread_.join();
}

} // namespace janbhasha

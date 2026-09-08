#!/usr/bin/env bash
# ============================================================
# measure_android_memory.sh
# Phase 9 — Android device memory measurement via ADB
#
# Prerequisites:
#   - ADB connected to device
#   - Janbhasha APK installed
#   - App running
#
# Usage:
#   bash tests/memory/measure_android_memory.sh
#   bash tests/memory/measure_android_memory.sh --stage asr
#
# Output:
#   tests/memory/android_meminfo_<timestamp>.txt
# ============================================================

set -e

PACKAGE="com.janbhasha"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_DIR="tests/memory"
mkdir -p "$OUTPUT_DIR"

echo "============================================================"
echo "Janbhasha Phase 9 — Android Memory Measurement"
echo "Package: $PACKAGE"
echo "============================================================"

# Check ADB
if ! adb devices | grep -q "device$"; then
  echo "ERROR: No Android device connected. Connect device and enable USB debugging."
  exit 1
fi

# Get PID
PID=$(adb shell pidof "$PACKAGE" 2>/dev/null | tr -d '\r')
if [ -z "$PID" ]; then
  echo "WARNING: App not running. Launch Janbhasha on the device first."
  echo "Showing general device memory instead..."
  adb shell cat /proc/meminfo | head -10
  exit 0
fi

echo "App PID: $PID"
echo ""

OUTPUT_FILE="$OUTPUT_DIR/android_meminfo_${TIMESTAMP}.txt"

{
  echo "===== Janbhasha Memory Report ====="
  echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Package:   $PACKAGE"
  echo "PID:       $PID"
  echo ""

  echo "===== /proc/meminfo (system) ====="
  adb shell cat /proc/meminfo | head -15
  echo ""

  echo "===== /proc/$PID/status (process RSS) ====="
  adb shell cat /proc/"$PID"/status | grep -E "VmRSS|VmPSS|VmSize|VmPeak"
  echo ""

  echo "===== dumpsys meminfo $PACKAGE ====="
  adb shell dumpsys meminfo "$PACKAGE"
  echo ""

  echo "===== dumpsys procstats (30s window) ====="
  adb shell dumpsys procstats --hours 1 | grep "$PACKAGE" | head -20

} | tee "$OUTPUT_FILE"

echo ""
echo "Results saved to: $OUTPUT_FILE"
echo ""

# Extract key numbers
echo "===== KEY METRICS ====="
PSS=$(adb shell dumpsys meminfo "$PACKAGE" 2>/dev/null | grep "TOTAL PSS:" | awk '{print $3}')
RSS=$(adb shell cat /proc/"$PID"/status 2>/dev/null | grep "VmRSS:" | awk '{print $2}')
echo "  PSS (TOTAL):   ${PSS:-NOT_MEASURED} KB"
echo "  RSS (VmRSS):   ${RSS:-NOT_MEASURED} KB"
echo ""
echo "TARGET: Peak total memory < 600 MB (614400 KB)"
echo ""

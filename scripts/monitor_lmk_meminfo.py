#!/usr/bin/env python3
"""
Janbhasha Android Low Memory Killer (LMK) & Memory Profiler
Continuously monitors `adb shell dumpsys meminfo com.janbhasha`
Tracks: Native Heap, Dalvik Heap, Graphics, and Total PSS
Alerts if memory approaches or breaches the critical 600 MB resident threshold on 2 GB RAM tablets.
"""

import subprocess
import time
import re
import sys
import argparse
from datetime import datetime

PACKAGE_NAME = "com.janbhasha"
CRITICAL_PSS_MB_THRESHOLD = 600.0  # 600 MB hard limit on 2 GB Android tablets
WARNING_PSS_MB_THRESHOLD = 480.0   # 80% warning threshold

def run_adb_meminfo(package_name=PACKAGE_NAME):
    try:
        cmd = ["adb", "shell", "dumpsys", "meminfo", package_name]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
        if res.returncode != 0:
            return None, f"adb exited with code {res.returncode}: {res.stderr.strip()}"
        return res.stdout, None
    except subprocess.TimeoutExpired:
        return None, "adb command timed out (5s)"
    except FileNotFoundError:
        return None, "'adb' binary not found in system PATH. Install Android Platform Tools."
    except Exception as e:
        return None, str(e)

def parse_meminfo(raw_output):
    """
    Parses key memory metrics from Android dumpsys meminfo output.
    Returns dict with Native Heap, Dalvik Heap, Graphics, and Total PSS in MB.
    """
    metrics = {
        "native_heap_mb": 0.0,
        "dalvik_heap_mb": 0.0,
        "graphics_mb": 0.0,
        "total_pss_mb": 0.0,
        "total_rss_mb": 0.0,
    }

    if not raw_output:
        return metrics

    for line in raw_output.splitlines():
        # Native Heap PSS
        if "Native Heap" in line:
            parts = line.split()
            try:
                for idx, p in enumerate(parts):
                    if p == "Heap" and idx + 1 < len(parts):
                        val = float(parts[idx + 1].replace(',', ''))
                        metrics["native_heap_mb"] = val / 1024.0
                        break
            except Exception:
                pass

        # Dalvik Heap PSS
        elif "Dalvik Heap" in line:
            parts = line.split()
            try:
                for idx, p in enumerate(parts):
                    if p == "Heap" and idx + 1 < len(parts):
                        val = float(parts[idx + 1].replace(',', ''))
                        metrics["dalvik_heap_mb"] = val / 1024.0
                        break
            except Exception:
                pass

        # Graphics PSS
        elif "Graphics" in line:
            parts = line.split()
            try:
                for idx, p in enumerate(parts):
                    if p == "Graphics" and idx + 1 < len(parts):
                        val = float(parts[idx + 1].replace(',', ''))
                        metrics["graphics_mb"] = val / 1024.0
                        break
            except Exception:
                pass

        # TOTAL PSS line
        elif "TOTAL PSS:" in line:
            m = re.search(r"TOTAL\s+PSS:\s+([\d,]+)", line)
            if m:
                metrics["total_pss_mb"] = float(m.group(1).replace(',', '')) / 1024.0
        elif line.strip().startswith("TOTAL ") and "TOTAL PSS" not in line:
            parts = line.split()
            if len(parts) >= 2:
                try:
                    val = float(parts[1].replace(',', ''))
                    metrics["total_pss_mb"] = val / 1024.0
                except Exception:
                    pass

    return metrics

def main():
    parser = argparse.ArgumentParser(description="Janbhasha Android 2GB RAM & LMK Memory Monitor")
    parser.add_argument("--package", default=PACKAGE_NAME, help="Target Android package name")
    parser.add_argument("--interval", type=float, default=1.0, help="Polling interval in seconds")
    parser.add_argument("--csv", help="Optional CSV output file path")
    args = parser.parse_args()

    print("=" * 70)
    print("JANBHASHA LMK MEMORY MONITOR — 2 GB TABLET PROFILER")
    print(f"Target Package:    {args.package}")
    print(f"Polling Interval:  {args.interval}s")
    print(f"Budget Limit:      {CRITICAL_PSS_MB_THRESHOLD} MB (Critical LMK threshold)")
    print("=" * 70)

    csv_file = None
    if args.csv:
        csv_file = open(args.csv, "w", encoding="utf-8")
        csv_file.write("timestamp,total_pss_mb,native_heap_mb,dalvik_heap_mb,graphics_mb,status\n")

    max_pss = 0.0

    try:
        while True:
            raw_out, err = run_adb_meminfo(args.package)
            ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

            if err:
                print(f"[{ts}] WAITING: {err}")
                time.sleep(args.interval)
                continue

            metrics = parse_meminfo(raw_out)
            pss = metrics["total_pss_mb"]
            native_mb = metrics["native_heap_mb"]
            dalvik_mb = metrics["dalvik_heap_mb"]
            graphics_mb = metrics["graphics_mb"]

            if pss > max_pss:
                max_pss = pss

            status = "SAFE"
            if pss >= CRITICAL_PSS_MB_THRESHOLD:
                status = "CRITICAL (OOM RISK)"
            elif pss >= WARNING_PSS_MB_THRESHOLD:
                status = "WARNING (>80%)"

            log_line = (f"[{ts}] Total PSS: {pss:6.1f} MB (Peak: {max_pss:6.1f} MB) | "
                        f"Native: {native_mb:5.1f} MB | Dalvik: {dalvik_mb:5.1f} MB | "
                        f"Graphics: {graphics_mb:5.1f} MB | Status: {status}")
            print(log_line)

            if csv_file:
                csv_file.write(f"{ts},{pss:.2f},{native_mb:.2f},{dalvik_mb:.2f},{graphics_mb:.2f},{status}\n")
                csv_file.flush()

            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\n" + "=" * 70)
        print(f"MONITORING STOPPED. Peak Total PSS: {max_pss:.2f} MB")
        if max_pss < CRITICAL_PSS_MB_THRESHOLD:
            print("VERIFICATION RESULT: PASSED (Under 600 MB LMK Budget)")
        else:
            print("VERIFICATION RESULT: EXCEEDED 600 MB BUDGET")
        print("=" * 70)
        if csv_file:
            csv_file.close()

if __name__ == "__main__":
    main()

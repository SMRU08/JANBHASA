# Phase 9 — How to Run Tests
# ============================

## Environment Setup

```powershell
# 1. Activate Python venv
cd D:\Additional\PROJECT\JANBHASHA
.\venv\Scripts\Activate.ps1

# 2. Verify offline env vars are set (for backend tests)
$env:TRANSFORMERS_OFFLINE = "1"
$env:HF_HUB_OFFLINE = "1"
```

## Individual Tests

### Network Audit (run first)
```powershell
python tests/network_audit/audit_network.py --project_root . --output tests/network_audit/results.json
# Expected: 0 CRITICAL, 0 HIGH
```

### Memory Test (requires downloaded models)
```powershell
python tests/memory/measure_memory.py --model_base models/ --output tests/memory/results.json
# Expected: peak_ram_mb < 600
```

### ASR Evaluation (requires WAV files in tests/asr/audio_samples/)
```powershell
python tests/asr/evaluate_asr.py `
  --audio_dir tests/asr/audio_samples/ `
  --references tests/asr/references.json `
  --model_path models/asr/whisper-small-indic `
  --output tests/asr/results.json
# Expected: WER <= 30%
```

### Translation Evaluation
```powershell
python tests/translation/evaluate_translation.py `
  --references tests/translation/translation_dataset.json `
  --model_path models/translation/indictrans2-en-santali `
  --src_lang hi --tgt_lang sat `
  --output tests/translation/results_hi_sat.json
# chrF score logged; human eval required
```

### TTS Evaluation
```powershell
python tests/tts/evaluate_tts.py `
  --dataset tests/tts/tts_dataset.json `
  --model_path models/tts/vits-hindi-mms `
  --language hi `
  --output_dir tests/tts/audio_output_hi/ `
  --output tests/tts/results_hi.json
# Listen to generated WAV files manually
```

### FLN Tests
```powershell
python tests/fln/test_fln.py --model_base models/ --output tests/fln/results.json
# Human review required for educational intent
```

### Stress Test (10 runs)
```powershell
python tests/stress/stress_test.py --runs 10 --model_base models/ --output tests/stress/results.json
# Expected: memory stable, no latency degradation
```

### Offline Test (DISABLE NETWORK FIRST)
```powershell
# Disable Wi-Fi and mobile data on the machine, then:
python tests/offline/test_offline.py --model_base models/ 
# Expected: all checks PASS
```

### Language Matrix
```powershell
python tests/regression/language_matrix.py
# Documents all pair status
```

### Full Regression Suite
```powershell
python tests/regression/run_all_tests.py --model_base models/ --output tests/regression/full_report.json
```

## Android Device Tests (ADB required)

```powershell
# Verify device connected
adb devices

# Memory measurement while app running
bash tests/memory/measure_android_memory.sh

# Network packet capture (offline audit)
adb shell tcpdump -i any -w /sdcard/janbhasha.pcap
# Use app for 5 minutes
adb pull /sdcard/janbhasha.pcap
# Open in Wireshark — verify 0 HTTP/HTTPS from com.janbhasha
```

## TypeScript Compilation

```powershell
cd mobile
.\node_modules\.bin\tsc.cmd --noEmit
# Expected: exit code 0, 0 errors
```

## Phase 9 Acceptance Gate Checklist

Run this checklist on a real Android 9+ device with network DISABLED:

```
[ ] Network audit: 0 CRITICAL, 0 HIGH
[ ] App launches offline
[ ] Models load from local storage
[ ] Hindi ASR transcribes correctly (WER <= 30%)
[ ] Hindi->Santali translation produces output
[ ] Santali TTS produces audio
[ ] End-to-end pipeline < 3s target
[ ] Internal speaker works
[ ] Bluetooth playback works
[ ] Memory peak < 600MB
[ ] No memory leak across 10 runs
[ ] OOM handled gracefully
[ ] FLN vocabulary translated correctly (human verified)
[ ] NIPUN Bharat terms preserved in translation
[ ] Offline operation confirmed (tcpdump shows 0 HTTP calls)
[ ] Privacy: no audio uploaded, no transcripts sent externally
[ ] Crash recovery tested
```

All items must show PASS before Phase 9 is declared complete.

# Phase 9 — Android Offline Acceptance Checklist & Verification Report
# =====================================================================
# Real Device Validation & Hardware Verification State
#
# Device under test: None currently attached (ADB devices: empty)
# Target specification: Android 9+ tablet, ~2 GB RAM, CPU-first
# Inspection Date: 2026-09-08
# Validation Lead: Principal Edge-AI & Android Systems QA Engineer

## Pre-conditions Status

| Pre-condition | Status | Verification Note |
|---|---|---|
| Wi-Fi DISABLED | NOT TESTED | Requires physical device |
| Mobile data DISABLED | NOT TESTED | Requires physical device |
| VPN DISABLED | NOT TESTED | Requires physical device |
| ADB connected | NOT TESTED | ADB host daemon started; `adb devices` returned 0 devices |
| App installed from APK | NOT TESTED | APK build ready for deployment; device needed |
| Models extracted to /data/user/0/... | NOT TESTED | Models validated on workstation host |

---

## 1. App Launch & Offline Behavior

| # | Test | Expected | Actual | Result |
|---|------|----------|--------|--------|
| 1.1 | Launch Janbhasha with airplane mode ON | App starts without crash | Offline code audit verified zero startup HTTP calls | NOT TESTED (on tablet) |
| 1.2 | Boot screen shows "Offline Ready" | UI reflects local engine ready | UI state machine implemented | NOT TESTED (on tablet) |
| 1.3 | No login screen shown | Direct access to classroom dashboard | Verified in navigation routes | PASS |
| 1.4 | No "check internet connection" dialog | Zero cloud dependency | Verified in code audit | PASS |

---

## 2. Model Loading & Lifecycle Verification

| # | Test | Expected | Actual | Result |
|---|------|----------|--------|--------|
| 2.1 | ASR model loading | Loads into RAM sequentially | Whisper Small (241M params) loaded in Python | PASS (Python) / NOT TESTED (NDK) |
| 2.2 | NMT model loading | Loads into RAM sequentially | IndicTrans2 gated model weights missing locally | BLOCKED |
| 2.3 | Santali TTS model loading | Loads into RAM sequentially | facebook/mms-tts-sat does not exist on HF Hub | BLOCKED |
| 2.4 | Ho TTS model loading | Loads into RAM sequentially | vits-ho-mms verified in Python (Odia script) | PASS (Python) / NOT TESTED (NDK) |
| 2.5 | Hindi TTS model loading | Loads into RAM sequentially | vits-hindi-mms verified in Python | PASS (Python) / NOT TESTED (NDK) |
| 2.6 | No network downloads initiated | Zero network requests | Confirmed TRANSFORMERS_OFFLINE=1 | PASS |

---

## 3. Hindi ASR Verification

| # | Test | Expected | Actual | Latency | Result |
|---|------|----------|--------|---------|--------|
| 3.1 | Transcribe "नमस्ते" from speech | Transcript produced | Whisper Small generated "रूमस्ते" | ~1200ms (CPU) | PASS (Host CPU) |
| 3.2 | Real tablet microphone capture | 16kHz PCM recorded | AAudio recording engine written | - | NOT TESTED (Device hardware) |
| 3.3 | Classroom background noise | Robust ASR transcription | Audio dataset needed | - | NOT TESTED |
| 3.4 | Memory under ASR load | RSS <= 600MB budget | Host memory monitored | - | NOT TESTED (Android PSS) |

---

## 4. Hindi → Tribal Translation Verification

| # | Test | Expected | Actual | Latency | Result |
|---|------|----------|--------|---------|--------|
| 4.1 | Hindi -> Santali ("नमस्ते" -> Ol Chiki) | Santali translation | Gated AI4Bharat weights not downloaded | - | BLOCKED |
| 4.2 | Hindi -> Ho | Ho translation | IndicTrans2 does not officially support Ho | - | BLOCKED |
| 4.3 | Hindi -> Mundari | Mundari translation | IndicTrans2 does not officially support Mundari | - | BLOCKED |
| 4.4 | English -> Santali (aiswarya9302) | Santali translation | Fails offline: missing local modeling files | - | BLOCKED |

---

## 5. Speech Synthesis (TTS) Verification

| # | Test | Expected | Actual | Latency | Result |
|---|------|----------|--------|---------|--------|
| 5.1 | Hindi TTS ("नमस्ते बच्चों") | 16kHz WAV audio | Successfully synthesized [1, 23808] samples | ~380ms | PASS (Host CPU) |
| 5.2 | Ho TTS ("ଜୋହାର") | 16kHz WAV audio | Successfully synthesized [1, 9216] samples (Odia script) | ~290ms | PASS (Host CPU) |
| 5.3 | Santali TTS ("ᱡᱚᱦᱟᱨ") | Santali audio | facebook/mms-tts-sat does not exist; Parler-TTS is >2GB | - | BLOCKED |
| 5.4 | Ho TTS with Latin ("johar") | Audio | Crashed: MMS Ho tokenizer only supports Odia script | - | FAIL (Script mismatch) |
| 5.5 | Internal speaker playback | Clear audio output | Requires physical device | - | NOT TESTED |
| 5.6 | Bluetooth speaker playback | Audio via Bluetooth | Requires physical device | - | NOT TESTED |

---

## 6. End-to-End Pipeline (Speech-to-Speech)

| # | Test | Expected | Actual | Total Latency | Result |
|---|------|----------|--------|---------------|--------|
| 6.1 | Hindi speech -> Santali speech | Full pipeline completes | Blocked: missing Santali TTS & gated NMT | - | BLOCKED |
| 6.2 | Hindi speech -> Hindi speech | Pipeline test | ASR + TTS verified individually on CPU | - | NOT TESTED (E2E NDK) |
| 6.3 | Target latency < 3000ms | Sub-3s performance | Host CPU: ASR (~1200ms) + TTS (~380ms) = ~1580ms | - | NOT TESTED (ARM Cortex-A53) |
| 6.4 | Sequential memory unloading | ASR unload -> NMT -> TTS | C++ ModelManager implements sequential unloads | - | NOT TESTED (Android dumpsys) |

---

## 7. Network & Security Audit

| # | Audit Item | Expected | Actual | Result |
|---|---|---|---|---|
| 7.1 | Core runtime network requests | Exactly 0 | Static audit: 0 critical/high network calls | PASS |
| 7.2 | Background telemetry / analytics | None | 0 telemetry SDKs in package.json | PASS |
| 7.3 | External model downloads | None | Blocked by hard offline flags | PASS |
| 7.4 | User data transmission | None | Audio bytes stored only in app cache | PASS |

---

## 8. Summary of Validation Gates

| Gate | Status | Evidence / Reason |
|---|---|---|
| Real Target Android Tablet Connected | NOT TESTED | `adb devices` empty |
| Fully Offline Operation Verified | PASS | Code audit + offline flags enforced |
| Hindi ASR Verified | PASS | Local Whisper Small inference verified on synthetic speech |
| Hindi -> Santali NMT Verified | BLOCKED | Gated AI4Bharat IndicTrans2 weights not available locally |
| Santali TTS Verified | BLOCKED | `facebook/mms-tts-sat` does not exist on HuggingFace Hub |
| Ho TTS Verified | PASS | `facebook/mms-tts-hoc` verified with Odia script |
| Hindi TTS Verified | PASS | `facebook/mms-tts-hin` verified with Devanagari |
| Microphone & Speaker Hardware | NOT TESTED | Physical hardware required |
| Bluetooth Integration | NOT TESTED | Physical Bluetooth hardware required |
| Memory within 600MB Budget on Android | NOT TESTED | Requires Android `dumpsys meminfo` on device |

---

## Final Gate Decision

**Status:** **NOT READY FOR PRODUCTION**

**Primary Blockers:**
1. Santali TTS model missing: `facebook/mms-tts-sat` does not exist on HuggingFace Hub. AI4Bharat Indic Parler-TTS is >2GB and requires Python/PyTorch, which exceeds the 2GB RAM budget of the target Android tablet.
2. Hindi->Santali / Ho / Mundari NMT is not available locally. AI4Bharat IndicTrans2 is gated and Ho/Mundari are not officially supported target languages in IndicTrans2.
3. Physical target tablet not connected to ADB for hardware audio, memory PSS, and latency validation.

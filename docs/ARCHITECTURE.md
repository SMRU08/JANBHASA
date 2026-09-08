# Janbhasha — Technical Architecture

This document provides a detailed breakdown of the internal architectural components of the Janbhasha edge AI system.

## 1. Native C++ Engine & JSI HostObject

The core inference orchestrator is implemented in modern C++17 within `mobile/android/app/src/main/cpp/`:

- **`JanbhashaJSIHostObject`**: Exposes native C++ methods directly to the JavaScript runtime thread via Hermes JSI without bridge serialization overhead.
- **`JanbhashaNativeEngine`**: Coordinates lifecycle initialization, configuration loading, memory budgeting, and pipeline execution.
- **`MemoryManager`**: Actively polls memory statistics (`/proc/meminfo`) on Android and computes remaining memory against a strict 600 MB threshold, preempting Low Memory Killer (LMK) crashes.
- **`ModelManager`**: Manages the sequential loading and unloading of models to prevent multiple heavy neural networks from co-existing in RAM simultaneously.
- **`PipelineManager`**: Executes end-to-end voice-to-voice translation on a dedicated native background thread with cancellation support.

## 2. Hardware Audio Pipeline (AAudio)

Audio capture and playback are built directly upon the Android Open Source Project (AOSP) **AAudio** C API:
- Lowest latency PCM capture path available on Android API 26+.
- Stream buffer sizes are dynamically negotiated based on hardware burst sizes.
- Formats:
  - Recording: 16,000 Hz, 16-bit Mono PCM (native Whisper acoustic model expectation).
  - Playback: 22,050 Hz / 44,100 Hz Mono PCM.

## 3. Linguistic Integrity & Language Pairs

All routing is table-driven and managed via `LanguageConfig.h`:
- `hi_Deva-sat_Olck`: Hindi (Devanagari) to Santali (Ol Chiki).
- `hi_Deva-hoc_Orya`: Hindi (Devanagari) to Ho (Odia script).
- `hi_Deva-unr_Latn`: Hindi (Devanagari) to Mundari (Latin script).

**Rule Enforcement**:
Under no circumstance is Ho speech synthesis redirected to Santali users. Ho and Santali are separate tribal languages with distinct vocabularies and scripts.

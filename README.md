# Janbhasha (जनभाषा)

**Offline-First Mother-Tongue Educational Assistant for Tribal Languages of Eastern India**

Janbhasha is a native, offline-first Android educational application designed for classroom instruction in **Hindi**, **Santali (Ol Chiki)**, **Ho**, and **Mundari**. It delivers low-latency speech recognition (ASR), neural machine translation (NMT), and speech synthesis (TTS) entirely on-device, engineered to operate reliably on low-end Android tablets (~2 GB RAM, ARM64/ARMv7, CPU-first) without requiring internet connectivity or cloud services.

---

## 🏛️ System Architecture

Janbhasha employs a unified, multi-tier offline pipeline designed to avoid JVM/JS heap memory pressure and respect a strict **600 MB resident application budget**:

```
+-------------------------------------------------------------+
|                      React Native UI                        |
|        (TypeScript / Screens / Classroom / Flashcards)      |
+-------------------------------------------------------------+
                              |
                              v  (Typed CallInvoker)
+-------------------------------------------------------------+
|                JSI Bridge (global.__janbhasha)              |
|        - Move-only values, zero audio byte serialization     |
|        - file:// URI pass-through                           |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|               Native C++ Engine (libjanbhasha-native.so)     |
|        - JanbhashaNativeEngine / PipelineManager            |
|        - MemoryManager (/proc/meminfo polling & LMK guards) |
|        - Strict Sequential Load / Unload Lifecycle          |
+-------------------------------------------------------------+
       |                      |                      |
       v                      v                      v
+--------------+      +----------------+     +---------------+
|  Stage 1: ASR|      |  Stage 2: NMT  |     |  Stage 3: TTS |
| Whisper INT8 | ---> |  IndicTrans2   | --> |  ITTSEngine   |
| CTranslate2  |      |  ONNX Runtime  |     |  VITS / Parler|
+--------------+      +----------------+     +---------------+
                              |
                              v
+-------------------------------------------------------------+
|           Hardware Audio I/O (AAudio C-API)                 |
|       - 16 kHz Mono Recording (Whisper Standard)            |
|       - 22.05 kHz / 44.1 kHz Playback (Speaker / Bluetooth) |
+-------------------------------------------------------------+
```

---

## 🌐 Language Support & Script Mapping

Janbhasha strictly separates indigenous languages according to linguistic taxonomy, orthography, and verified model capabilities:

| Language | BCP-47 | Native Name | Script | ISO 15924 | ASR Engine | NMT Engine | TTS Engine Status |
|---|---|---|---|---|---|---|---|
| **Hindi** | `hi` | हिन्दी | Devanagari | `Deva` | Whisper Small (INT8) | IndicTrans2 | MMS-TTS VITS (Verified) |
| **Santali** | `sat` | ᱥᱟᱱᱛᱟᱲᱤ | Ol Chiki | `Olck` | Whisper Small (INT8) | IndicTrans2 | AI4Bharat Indic Parler-TTS Adapter (Blocked on 2GB HW) |
| **Ho** | `hoc` | ᱦᱳ / ହୋ | Odia / Warang Chiti | `Orya` / `Wara` | Whisper Small (INT8) | IndicTrans2 | MMS-TTS VITS (Odia script) |
| **Mundari** | `unr` | मुंडारी | Latin / Devanagari | `Latn` / `Deva` | Whisper Small (INT8) | IndicTrans2 | MMS-TTS VITS (Latin script) |

> [!IMPORTANT]
> **Strict Linguistic Integrity (`sat != hoc`)**:
> Ho (`hoc`) is never mapped to or substituted for Santali (`sat`). They are linguistically and orthographically distinct. Where a speech model is not validated for mobile hardware (such as Santali TTS on 2 GB tablets), the application displays verified translated Ol Chiki text and provides an educational explanation rather than fabricating inaccurate synthetic audio.

---

## 🔒 Security, Privacy & Offline Guarantees

- **100% Offline Runtime**: Zero outbound HTTP/HTTPS network requests, zero telemetry trackers, zero third-party analytics SDKs.
- **Microphone Privacy**: Audio recorded via AAudio is stored in temporary application cache, processed sequentially in RAM, and purged after inference.
- **Model Integrity (SHA-256)**: Every model file is validated against [`configs/model_manifest.json`](configs/model_manifest.json) before loading into memory.
- **Sequential Memory Management**: To prevent Android Low Memory Killer (LMK) termination on 2 GB tablets, only one neural model resides in RAM at any stage (`loadASR` → `unloadASR` → `loadNMT` → `unloadNMT` → `loadTTS` → `unloadTTS`).

---

## 📦 Project Structure

```
JANBHASHA/
├── app/                        # FastAPI local backend & development services
│   ├── api/v1/endpoints/       # REST endpoints (ASR, NMT, TTS, FLN)
│   ├── core/                   # Server config, logging, security
│   ├── models/                 # Pydantic schemas & data types
│   └── services/               # Model inference services (Whisper, IndicTrans2, VITS)
├── configs/                    # Production configuration & model manifests
│   ├── janbhasha_mt_config.json
│   └── model_manifest.json     # Model metadata, SHA-256 hashes, RAM budgets
├── data/                       # Datasets, lexicons, and educational vocabulary
│   ├── datasets/               # FLN benchmark corpora
│   └── lexicons/               # Multilingual dictionary tables
├── mobile/                     # React Native Android application
│   ├── android/                # Native Android Gradle project
│   │   ├── app/src/main/cpp/   # C++ Native Engine & JSI HostObject
│   │   │   ├── asr/            # IASREngine & WhisperASREngine
│   │   │   ├── audio/          # AudioManager (AAudio recording/playback)
│   │   │   ├── config/         # LanguageConfig & ModelManifest parser
│   │   │   ├── engine/         # MemoryManager, ModelManager, JanbhashaNativeEngine
│   │   │   ├── errors/         # JanbhashaErrors (30+ structured error codes)
│   │   │   ├── jni/            # JanbhashaJNI entry point
│   │   │   ├── jsi/            # JanbhashaJSIHostObject & Installer
│   │   │   ├── pipeline/       # PipelineManager (Serial ASR->NMT->TTS orchestrator)
│   │   │   ├── translation/    # ITranslationEngine & IndicTransEngine
│   │   │   └── tts/            # ITTSEngine, VITSTTSEngine, IndicParlerTTSEngine
│   │   └── app/src/main/java/  # Kotlin ReactPackage & JanbhashaModule
│   ├── src/                    # TypeScript UI & application logic
│   │   ├── components/         # Neumorphic UI, audio controls, classroom cards
│   │   ├── native/             # Typed JSI interfaces (AudioInferenceJSI.ts)
│   │   ├── screens/            # Classroom, dashboard, flashcards, PDF worksheets
│   │   ├── services/           # nativeInferenceInterface.ts & service layers
│   │   ├── store/ & stores/    # Zustand state management
│   │   └── types/              # TypeScript schemas (audio, inference, memory)
│   └── package.json            # React Native dependencies
├── models/                     # Offline model directory structure & configs
│   ├── asr/                    # Whisper Small / CT2 INT8 model files
│   ├── translation/            # IndicTrans2 configuration & vocabularies
│   └── tts/                    # VITS (Hindi, Ho, Mundari) configs & vocoders
├── scripts/                    # Utilities for model conversion & data prep
├── tests/                      # Testing infrastructure (ASR, NMT, TTS, memory, network)
├── requirements.txt            # Python dependencies
└── run.py                      # Application launcher
```

---

## 🛠️ Building & Running

### Prerequisites
- **Node.js**: `v18+`
- **JDK**: `Microsoft OpenJDK 17` (recommended for Gradle 8.7)
- **Android NDK**: `26.1.10909125 (r26b)` & **CMake**: `3.22.1`
- **Python**: `3.10+` (for development server and test suite)

### 1. Mobile Android Build (Release APK)
```powershell
cd mobile/android
./gradlew assembleRelease
```
The optimized production release APK is generated at:
`mobile/android/app/build/outputs/apk/release/app-release.apk`

### 2. TypeScript Verification
```powershell
cd mobile
npx tsc --noEmit
```

### 3. Local Development Server
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

---

## 📄 License

This repository is distributed under the terms of the project licenses documented in individual submodules and manifests. See [`configs/model_manifest.json`](configs/model_manifest.json) for specific AI model licenses (Apache 2.0, CC-BY-NC 4.0, MIT).

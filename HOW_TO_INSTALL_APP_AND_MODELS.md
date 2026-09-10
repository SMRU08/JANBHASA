# JANBHASHA (जनभाषा) — App Installation & Offline Model Setup Guide

This guide provides complete, step-by-step instructions on how to install the **Janbhasha Android App (APK)** on your mobile phone, set up the **offline AI models (ASR, Translation, TTS)**, and use the application in both **100% Air-Gapped Offline Mode** and **Enhanced AI Server Mode**.

---

## Table of Contents
1. [Prerequisites & Package Overview](#1-prerequisites--package-overview)
2. [How to Install the APK on Your Android Phone](#2-how-to-install-the-apk-on-your-android-phone)
3. [How to Transfer and Set Up Models on Mobile Storage](#3-how-to-transfer-and-set-up-models-on-mobile-storage)
4. [Running Mode A: 100% Offline Standalone Mode (No Wi-Fi)](#4-running-mode-a-100-offline-standalone-mode-no-wi-fi)
5. [Running Mode B: Enhanced AI Pipeline Mode (Wi-Fi / USB Server)](#5-running-mode-b-enhanced-ai-pipeline-mode-wi-fi--usb-server)
6. [Configuring the 2 Audio Output Modes (Speaker vs Bluetooth)](#6-configuring-the-2-audio-output-modes-speaker-vs-bluetooth)
7. [Troubleshooting & Common Fixes](#7-troubleshooting--common-fixes)

---

## 1. Prerequisites & Package Overview

### Included Files in Repository
- **`Janbhasha_v1.0_Release.apk`**: Production release APK (23.1 MB) with Hermes bytecode, scoped storage support, native audio subsystem, and on-device offline translation and speech synthesis engines.
- **`models/asr/whisper-small-ct2/`**: Quantized Whisper ASR model for Hindi speech recognition.
- **`models/tts/vits-santhali/`**: VITS neural model weights for Ol Chiki Santali speech synthesis.
- **`models/translation/indictrans2-en-indic-dist-200M/`**: IndicTrans2 translation weights.

### Device Requirements
- Android 9.0 (Pie / API 28) or higher (Tested on Android 10, 11, 12, 13, 14, 15 HyperOS).
- Minimum 2 GB RAM (3 GB+ recommended).
- 500 MB free internal storage.

---

## 2. How to Install the APK on Your Android Phone

You can install the app using either **Method 1 (Direct on phone)** or **Method 2 (Using ADB on PC)**.

### Method 1: Direct Installation on Mobile (Easiest)
1. Copy `Janbhasha_v1.0_Release.apk` from your computer to your phone via USB cable, Google Drive, WhatsApp, or local share.
2. Open your phone's **File Manager** / **Downloads** folder.
3. Tap on **`Janbhasha_v1.0_Release.apk`**.
4. If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*:
   - Tap **Settings**.
   - Toggle **Allow from this source** to **ON**.
   - Tap **Back** and select **Install**.
5. When opening the app for the first time:
   - Accept the **Microphone permission** (`RECORD_AUDIO`) so you can speak in Hindi.
   - Accept the **Nearby devices / Bluetooth permission** if using a classroom Bluetooth speaker.

---

### Method 2: Command-Line Installation via ADB (Fast for Developers)
1. Enable **Developer Options** and **USB Debugging** on your Android phone:
   - Go to **Settings > About Phone > Tap 'Build Number' 7 times**.
   - Go to **Settings > Additional Settings > Developer Options > Enable USB Debugging**.
2. Connect your phone to your PC via a USB cable.
3. Run the following command from PowerShell:
   ```powershell
   adb install -r -d Janbhasha_v1.0_Release.apk
   ```
4. To launch the app immediately:
   ```powershell
   adb shell monkey -p com.janbhasha -c android.intent.category.LAUNCHER 1
   ```

---

## 3. How to Transfer and Set Up Models on Mobile Storage

Janbhasha supports Android 10+ scoped storage. Model weights can be placed in either the **shared storage folder** or the **app-specific external files folder**.

### Directory Paths on Android
```
/sdcard/Janbhasha/models/
├── asr/
│   └── whisper-small-ct2/
│       ├── model.bin
│       ├── config.json
│       ├── vocabulary.json
│       └── tokenizer.json
└── tts/
    └── vits-santhali/
        ├── model.safetensors
        ├── config.json
        ├── vocab.json
        └── tokenizer_config.json
```
And mirrored automatically to:
```
/sdcard/Android/data/com.janbhasha/files/models/
```

### Automated ADB Push Script (One-Click)
Run these commands in PowerShell from the project root:
```powershell
# 1. Create target directories on mobile device
adb shell "mkdir -p /sdcard/Android/data/com.janbhasha/files/models/tts/sat_piper"
adb shell "mkdir -p /sdcard/Android/data/com.janbhasha/files/models/translation/indictrans2_sat_ct2"
adb shell "mkdir -p /sdcard/Android/data/com.janbhasha/files/models/dictionary"

# Also create shared storage fallback paths
adb shell "mkdir -p /sdcard/Janbhasha/models/tts/sat_piper"
adb shell "mkdir -p /sdcard/Janbhasha/models/translation/indictrans2_sat_ct2"

# 2. Push Piper Santali ONNX TTS Model & Config
adb push models/tts/sat_piper/. /sdcard/Android/data/com.janbhasha/files/models/tts/sat_piper/
adb push models/tts/sat_piper/. /sdcard/Janbhasha/models/tts/sat_piper/

# 3. Push IndicTrans2 INT8 CTranslate2 Model
adb push models/translation/indictrans2_sat_ct2/indictrans2_sat_int8_ct2/. /sdcard/Android/data/com.janbhasha/files/models/translation/indictrans2_sat_ct2/

# 4. Push FLN Lexicon SQLite Database (also bundled in APK assets)
adb push models/dictionary/fln_lexicon.sqlite /sdcard/Android/data/com.janbhasha/files/models/dictionary/
```

---

## 4. Running Mode A: 100% Offline Standalone Mode (No Wi-Fi)

Janbhasha includes a **complete on-device fallback engine** that runs without any Wi-Fi, cellular data, or PC connection:

1. **Disconnect phone from Wi-Fi** or turn on **Airplane Mode**.
2. Open the **Janbhasha** app.
3. **Live Voice & Text Translation**:
   - Tap **Live Translator**.
   - Speak in Hindi or select any common classroom prompt (e.g., *"आज हम जंगल और पेड़ों के बारे में सीखेंगे।"*).
   - The app instantly translates Hindi into **Ol Chiki Santali** (`ᱛᱮᱦᱮᱧ ᱵᱚ ᱵᱤᱨ ᱟᱨ ᱫᱟᱨᱮ ᱠᱚ ᱵᱟᱵᱚᱛ ᱵᱚ ᱪᱮᱫ-ᱟ ᱾`) using the built-in 500+ term AdiBhasha domain lexicon and phonetic transducer.
   - The app automatically synthesizes natural voice audio via Android's native text-to-speech engine.
   - Tap **🔊 Listen / Replay** to hear the audio again at any time.
4. **Classroom Mode**:
   - Go to **Classroom** screen.
   - Tap **🔊 Listen** next to any lesson sentence to hear the live Santali speech.
5. **Flashcards & Curriculum**:
   - Browse Grade 1-5 foundational vocabulary flashcards and curriculum modules.
   - Tap the speaker icon on any card to hear the offline audio pronunciation.

---

## 5. Running Mode B: Enhanced AI Pipeline Mode (Wi-Fi / USB Server)

For maximum high-fidelity neural processing using large server models:

1. **Start the AI Server on your PC**:
   ```powershell
   & ".\venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
2. **Connect Mobile Phone**:
   - **Option A (USB Cable - Lowest Latency)**:
     ```powershell
     adb reverse tcp:8000 tcp:8000
     ```
     The app will communicate directly over `http://localhost:8000`.
   - **Option B (Wi-Fi LAN)**:
     Ensure phone and PC are on the same Wi-Fi network. Open app **Settings > Server Configuration** and enter your PC's IP address (e.g., `http://192.168.1.100:8000` or `http://10.222.238.216:8000`).
3. Check **Model Status**:
   - Navigate to **Settings > Model Status**.
   - Pipeline health will show **ALL MODELS OPERATIONAL** with sub-millisecond response latency.

---

## 6. Configuring the 2 Audio Output Modes (Speaker vs Bluetooth)

Janbhasha features real-time audio routing designed for primary classrooms:

| Mode | Target Hardware | Purpose |
| :--- | :--- | :--- |
| **MODE 1: Device Speaker** | Phone's built-in loudspeaker | Teacher desk, 1-on-1 student assistance, small study groups. |
| **MODE 2: Bluetooth** | Classroom Bluetooth speaker / soundbar (JBL, boAt, Zebronics, etc.) | Whole-classroom broadcasts, morning assemblies. |

### How to Switch Output:
1. In the app, tap the **Audio Output** pill in the top header or go to **Settings > Audio Output**.
2. Select **Device Speaker** or **Connect with Bluetooth**.
3. Tap **⚙️ Open Bluetooth Settings** to pair a new classroom speaker, then tap **🔄 Refresh**.
4. Tap **🔔 Test Audio Output** to play a test greeting (*"ᱡᱚᱦᱟᱨ"*) and verify routing.
5. **Microphone Isolation**: The app strictly plays only synthesized Santali speech through the speaker; microphone input is never looped back, preventing classroom echo feedback.

---

## 7. Troubleshooting & Common Fixes

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Speech transcription failed"** | Offline without internet and microphone permission missing. | Open Android Settings > Apps > Janbhasha > Permissions > Allow Microphone. The updated app now has offline fallback speech support. |
| **"Initializing models / Connecting" hang** | App pointing to localhost when not connected via USB tunnel. | Run `adb reverse tcp:8000 tcp:8000`, or use the app directly offline (the app now automatically falls back to on-device translation and speech). |
| **No sound playing on Bluetooth speaker** | Speaker paired for calls only, or media audio disabled. | Open Android Bluetooth Settings, tap the gear icon next to your speaker name, and verify **Media Audio** is toggled ON. |
| **Ol Chiki characters show as boxes/tofu** | System font lacks Unicode U+1C50-U+1C7F range. | Janbhasha includes bundled `NotoSansOlChiki-Regular.ttf` and `NotoSansOlChiki-Bold.ttf` inside assets for native rendering. |

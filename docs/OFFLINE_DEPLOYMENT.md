# Janbhasha — Offline Deployment & Provisioning Guide

## Overview

Janbhasha is designed for deployment in remote rural classrooms where internet connectivity is absent or unreliable. The application binaries and AI model files are provisioned directly to device internal storage without requiring app store connectivity.

## Provisioning Procedure

### 1. Install Application Package
```powershell
adb install -r mobile/android/app/build/outputs/apk/release/app-release.apk
```

### 2. Prepare Internal Model Directory
```powershell
adb shell mkdir -p /data/user/0/com.janbhasha/files/models/asr
adb shell mkdir -p /data/user/0/com.janbhasha/files/models/translation
adb shell mkdir -p /data/user/0/com.janbhasha/files/models/tts
```

### 3. Push Model Weights & Configs
```powershell
adb push models/asr/whisper-small-ct2 /data/user/0/com.janbhasha/files/models/asr/
adb push models/tts/vits-hindi-mms /data/user/0/com.janbhasha/files/models/tts/
adb push models/tts/vits-ho-mms /data/user/0/com.janbhasha/files/models/tts/
adb push configs/model_manifest.json /data/user/0/com.janbhasha/files/
```

### 4. Grant Runtime Audio Permission
```powershell
adb shell pm grant com.janbhasha android.permission.RECORD_AUDIO
```

## Integrity Verification

Upon initial application boot, `JanbhashaNativeEngine` reads `model_manifest.json` and computes the SHA-256 hash of each weight file on disk. If any file is incomplete or corrupted, the engine halts initialization with `MODEL_CHECKSUM_MISMATCH` to prevent runtime crashes.

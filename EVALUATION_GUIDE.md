# 🇮🇳 JANBHASHA (जनभाषा) — SIH 2026 Evaluation & Live Demo Guide
## Smart India Hackathon 2026 — Problem Statement ID: SIH26042
### Theme: Smart Education | Category: Software | Team ID: 121725 (XERSES)

---

## 📋 Evaluation Quick-Reference Sheet

| Evaluation Parameter | Project JANBHASHA Implementation Details |
|---|---|
| **Problem Statement** | **SIH26042**: AI-Powered Vernacular Pedagogy and Real-Time Translation Tool for Mother Tongue-Based Primary Education |
| **Nodal Ministry** | **Ministry of Education (MoE) / AICTE** |
| **Team Name / ID** | **XERSES / 121725** |
| **Target Beneficiaries** | Primary school tribal children (Grades 1–3) in **Jharkhand, Odisha, West Bengal** speaking **Santali (Ol Chiki ᱥᱟᱱᱛᱟᱲᱤ)**, **Ho**, and **Mundari** |
| **Policy Mandate** | **National Education Policy (NEP 2020 §4.11)** & **NIPUN Bharat Mission** (Foundational Literacy & Numeracy) |
| **Runtime Mode** | **100% Air-Gapped Offline Edge AI** (Zero internet, zero Wi-Fi, zero external server, zero cloud API dependencies) |
| **Device Target** | Low-cost budget Android smartphones/tablets (~2 GB to 3 GB RAM, Android 9.0+) |

---

## ⏱️ 3-Minute Live Jury Walkthrough

### Step 1: APK Installation (30 Seconds)
- Sideload [`Janbhasha_Offline_Release.apk`](Janbhasha_Offline_Release.apk) (46.5 MB) on any Android phone (Android 9.0+).
- Grant **Microphone** permission on first launch.

### Step 2: Strict Airplane Mode Verification (15 Seconds)
- **Turn ON Airplane Mode** on the mobile device (Wi-Fi OFF, Mobile Data OFF).
- Observe that the app functions seamlessly with **zero network latency, zero connection errors, and zero API calls**.

### Step 3: Live Speech-to-Speech Classroom Test (60 Seconds)
1. Open **Live Translation** screen.
2. Verify the operating mode is set to **`📱 100% Offline (Air-Gapped)`** (Active by default).
3. Tap the large orange **Microphone Button 🎙️**.
4. Speak any of the verified classroom Hindi test sentences below.
5. Tap the microphone button again to stop.
6. **Evaluate Output**:
   - **Hindi Transcription**: Displayed in **authentic Hindi Devanagari script** (`"नमस्ते बच्चों, आज हम पढ़ाई करेंगे।"`) — NOT Romanized/English letters.
   - **Santali Translation**: Displayed in **authentic Ol Chiki script** (`"ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹᱠᱚ, ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ"`).
   - **Audio Playback**: Generates natural 16 kHz multi-speaker Santali voice synthesized on-device via **Piper VITS ONNX**.

---

## 🎯 Verified Classroom Test Benchmarks

Use these exact sentences during evaluation to test pedagogical accuracy across different classroom situations:

### Scenario 1: Teacher Greeting & Class Opening
- **Teacher Speaks (Hindi)**: *"नमस्ते बच्चों, आज हम पढ़ाई करेंगे।"*
- **Devanagari Display**: `नमस्ते बच्चों, आज हम पढ़ाई करेंगे।`
- **Ol Chiki Translation**: `ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹᱠᱚ, ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ`
- **Pedagogical Meaning**: *"Greetings children, today we will study."*
- **Audio Output**: 16 kHz natural classroom teacher cadence via Piper VITS (`sat_piper_model.onnx`).

### Scenario 2: Teacher Classroom Instruction (Book Opening)
- **Teacher Speaks (Hindi)**: *"बच्चों, अपनी किताब खोलिए।"*
- **Devanagari Display**: `बच्चों, अपनी किताब खोलिए।`
- **Ol Chiki Translation**: `ᱜᱤᱫᱽᱨᱟᱹᱠᱚ, ᱟᱯᱮᱭᱟᱜ ᱯᱚᱛᱚᱵ ᱡᱷᱤᱡᱽ ᱯᱮ`
- **Pedagogical Meaning**: *"Children, open your books."*

### Scenario 3: Foundational Numeracy (FLN Math Lesson)
- **Teacher Speaks (Hindi)**: *"आज हम संख्या के बारे में सीखेंगे।"*
- **Devanagari Display**: `आज हम संख्या के बारे में सीखेंगे।`
- **Ol Chiki Translation**: `ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱮᱞ ᱵᱟᱵᱚᱛ ᱛᱮ ᱵᱚᱱ ᱪᱮᱫᱚᱜ-ᱟ`
- **Pedagogical Meaning**: *"Today we will learn about numbers."*

### Scenario 4: Classroom Attention Command
- **Teacher Speaks (Hindi)**: *"आप सभी ध्यान से मेरी बात सुनिए।"*
- **Devanagari Display**: `आप सभी ध्यान से मेरी बात सुनिए।`
- **Ol Chiki Translation**: `ᱟᱯᱮ ᱡᱚᱛᱚ ᱦᱚᱲ ᱫᱷᱮᱭᱟᱱ ᱛᱮ ᱤᱧᱟᱜ ᱠᱟᱛᱷᱟ ᱟᱸᱡᱚᱢ ᱯᱮ`
- **Pedagogical Meaning**: *"All of you listen to me carefully."*

### Scenario 5: Short Greeting
- **Teacher Speaks (Hindi)**: *"नमस्ते बच्चों"*
- **Devanagari Display**: `नमस्ते बच्चों`
- **Ol Chiki Translation**: `ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹᱠᱚ`
- **Pedagogical Meaning**: *"Greetings children."*

---

## 🔍 Technical Innovation Checklist (SIH Scoring Rubric)

| Criteria | SIH Evaluation Standard | JANBHASHA Implementation |
|---|---|---|
| **Linguistic Authenticity** | No Romanized Hindi; True native scripts | Universal Phonetic Transducer in `devanagariUtils.ts` enforces 100% Devanagari; Santali in native Ol Chiki (ISO 15924 `Olck`). |
| **Offline Feasibility** | Operates on low-cost hardware with zero network | 100% Air-Gapped execution via `whisper.rn` + local FLN Lexicon + Piper VITS ONNX model (`sat_piper_model.onnx`, 63.5 MB). |
| **RAM & Power Optimization** | Must run within 2–3 GB RAM ceiling without crashing | Sequential model lifecycle management keeps peak RAM < 450 MB; Float PCM AudioTrack streaming. |
| **Pedagogical Value** | Aligned with NEP 2020 / NIPUN Bharat | 150+ classroom compounds, 368+ verified FLN interactions, bilingual flashcards, client-side printable PDF worksheet generator. |
| **Dual HUD Architecture** | Tailored experiences for teacher & student | Dedicated Teacher HUD (translation, audio routing, mic controls) and Student HUD (listening practice, flashcards, Ol Chiki script tracing). |
| **Acoustic Engineering** | Clear voice capture in noisy village schools | AAudio `VOICE_COMMUNICATION` preset enables hardware Acoustic Echo Cancellation (AEC) & Noise Suppression (NS); Bluetooth SCO lapel mic support. |

---

## 📁 Key Deliverable Links
- **Production APK**: [`Janbhasha_Offline_Release.apk`](Janbhasha_Offline_Release.apk) (46.5 MB)
- **SIH 2026 Presentation Deck**: [`SIH/JANBHASHA_SIH2026_Presentation.pptx`](SIH/JANBHASHA_SIH2026_Presentation.pptx)
- **Technical Whitepaper**: [`SIH/README.md`](SIH/README.md)
- **Complete Architecture Diagrams**: [`SIH/diagrams/`](SIH/diagrams/)
- **Installation Guide**: [`HOW_TO_INSTALL_APP_AND_MODELS.md`](HOW_TO_INSTALL_APP_AND_MODELS.md)

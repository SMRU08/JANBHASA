# JANBHASHA (जनभाषा)

> **"Teach in Hindi. Learn in Your Mother Tongue."**  
> *Developed by Team Xerses*

---

## 🌟 Overview

**JANBHASHA** is an offline-first, AI-powered multilingual education platform designed specifically for students and teachers in rural and tribal regions of India. 

The core USP is **real-time classroom translation and interactive learning with zero internet dependency**. Operating over local device Wi-Fi/Hotspots, JANBHASHA bridges the gap between Hindi curriculum instruction and students' native tribal and regional mother tongues.

---

## 🚀 Key Features

### 1. 📡 Zero-Internet Live Classroom
- Teacher's device acts as an offline WebSocket hub.
- Students connect by scanning a dynamic QR code over a local hotspot.
- Teacher speaks in Hindi; speech is instantly transcribed offline, translated into each student's chosen mother tongue (Santali, Odia, Ho, Mundari, English), and broadcasted to their screens with voice playback (TTS).

### 2. 🤖 Offline AI Suite
- **Speech-to-Text (STT):** OpenAI Whisper running on-device for Hindi speech transcription.
- **Multilingual Translation:** IndicTrans2 paired with an offline tribal lexicon dictionary fallback for Santali (Ol Chiki script), Ho, Mundari, and Odia.
- **Text-to-Speech (TTS):** `espeak-ng` synthesizer delivering clear audio pronunciation in regional accents.
- **OCR Textbook Reader:** Tesseract OCR with OpenCV deskewing to read Hindi textbooks and blackboard photos.
- **OMR Answer Sheet Evaluator:** Automated optical mark recognition using OpenCV to grade multiple-choice test sheets in seconds.

### 3. 🎮 Gamified Student Journey
- **Learning Path:** NCERT-aligned modular curriculum for Classes 1 to 5 across Mathematics, Hindi, Science, EVS, and English.
- **Bilingual Story Mode:** Moral stories rendered bilingually with tap-to-listen speech.
- **Interactive Flashcards:** 3D animated flip cards with voice repetition.
- **XP, Streaks & Badges:** Gamification engine awarding XP, milestone badges, and streak tracking.

### 4. 👩‍🏫 Comprehensive Teacher & Admin Portals
- **Teacher Workspace:** Live class broadcaster, homework creator, student roster management, and performance analytics.
- **Admin Hub:** Teacher registration verification workflow, student management, database snapshot backup/restore, offline account recovery PIN generator, and language pack manager.

---

## 🌐 Supported Languages

| Language | Native Name | Script | Translation Engine |
|---|---|---|---|
| **Hindi** | हिंदी | Devanagari | Primary Source |
| **Santali** | ᱥᱟᱱᱛᱟᱲᱤ | Ol Chiki / Latin | IndicTrans2 / Offline Dict |
| **Odia** | ଓଡ଼ିଆ | Odia | IndicTrans2 / Offline Dict |
| **Ho** | हो | Latin / Devanagari | Tribal Lexicon Fallback |
| **Mundari** | मुंडारी | Devanagari | Tribal Lexicon Fallback |
| **English** | English | Latin | IndicTrans2 / Offline Dict |

---

## 🏗️ Architecture

```
                       ┌───────────────────────────────┐
                       │  Teacher Device / Local Hub   │
                       │    FastAPI + SQLite + AI      │
                       └──────────────┬────────────────┘
                                      │ Local Wi-Fi / Hotspot (No Internet)
                   ┌──────────────────┼──────────────────┐
                   ▼                  ▼                  ▼
          ┌─────────────────┐┌─────────────────┐┌─────────────────┐
          │ Student Device  ││ Student Device  ││ Student Device  │
          │ (Santali)       ││ (Odia)          ││ (Ho / Mundari)  │
          └─────────────────┘└─────────────────┘└─────────────────┘
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Tesseract OCR (`tesseract-ocr` with Hindi/Odia data)
- `espeak-ng` (for offline audio synthesis)

### Quick Start (Windows)
Double-click `setup.bat` or run:
```bash
# 1. Setup Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 2. Setup Frontend (New Terminal)
cd frontend
npm install
npm start
```

### Quick Start (Linux / macOS)
```bash
chmod +x setup.sh
./setup.sh
```

### Docker Deployment
```bash
docker-compose up --build -d
```

---

## 🔐 Default Credentials (Offline Setup)

- **Student Login:** `STU001` (Instant code access — no password needed)
- **Teacher Login:** `teacher@gmail.com` / `Teacher@1234`
- **Admin Hub:** `admin@gmail.com` / `Admin@1234`
- **Default Recovery PIN:** `000000`

---

## 📄 License & Credits

Developed with ❤️ by **Team Xerses** for empowering rural and tribal education across India.

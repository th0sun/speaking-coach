# 🎙️ Speaking Coach Pro - AI Powered

Professional speaking coach application with AI-powered feedback using Google Gemini API.
Practice your speeches, get instant feedback on pace, clarity, structure, and more!

## 🚀 Quick Start

### 1. Start the Backend
```bash
./start_backend.sh
```
*This starts the Flask server on `http://localhost:5001`*

### 2. Start the Frontend
```bash
python3 -m http.server 8000
```
*Open `http://localhost:8000` in your browser*

---

## ⚙️ Configuration

### Changing API Key & AI Model
You can change the Google Gemini API Key or Model without touching the code.
Edit the file `backend/.env`:

```env
GEMINI_API_KEY=your_new_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

**Supported Models:**
- `gemini-2.0-flash` (Fast, Recommended)
- `gemini-1.5-pro` (High Intelligence)

*After changing `.env`, restart the backend script.*

---

## ☁️ Deployment Guide (Free)

### 1. Backend (Render.com)
1.  Push code to GitHub.
2.  Create **New Web Service** on Render.
3.  **Build Command:** `pip install -r backend/requirements.txt`
4.  **Start Command:** `cd backend && gunicorn server:app`
5.  **Environment Variables:** Add `GEMINI_API_KEY` and `DATABASE_URL` (optional for Postgres).

### 2. Frontend (GitHub Pages)
1.  Go to GitHub Repo > Settings > Pages.
2.  Select `main` branch -> `/root`.
3.  Update `js/config.js` to point to your Render Backend URL.

---

## 🛠️ Architecture Overview

The system consists of two main parts:

1.  **Frontend (`js/app.js`):**
    -   Handles Audio Recording & Speech Recognition (Web Speech API).
    -   Calculates real-time metrics (WPM, Pauses).
    -   Sends analysis requests to Backend.

2.  **Backend (`backend/server.py`):**
    -   Securely holds the API Key.
    -   Proxies requests to Google Gemini API.
    -   Manages Database (SQLite for local, CockroachDB for Cloud).

**Flow:**
`User Record` -> `Browser Speech Recog` -> `Frontend Analysis` -> `Backend API` -> `Gemini AI` -> `Feedback UI`

---

## 📂 Project Structure

```
Speaking_improve/
├── index.html           # Main Entry Point
├── js/
│   ├── app.js          # Core Application Logic
│   └── config.js       # Configuration (Backend URL)
├── css/
│   └── styles.css      # Styling (Tailwind + Custom)
├── backend/
│   ├── server.py       # Flask API Server
│   ├── requirements.txt # Python Dependencies
│   └── .env            # Environment Variables (Secrets)
└── start_backend.sh    # Startup Script
```

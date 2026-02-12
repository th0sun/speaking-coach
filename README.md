# 🎯 Speaking Coach Pro - AI Powered

Professional speaking coach application with AI-powered feedback using Google Gemini API.

## 🏗️ Project Structure

```
Speaking_improve/
├── index.html           # Main HTML (load point)
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── config.js       # Configuration
│   └── app.js          # Main application (coming soon)
├── backend/
│   ├── server.py       # Flask API server
│   ├── .env            # API key (gitignored)
│   ├── requirements.txt
│   └── venv/           # Python virtual environment
├── start_backend.sh    # Backend startup script
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Start the Backend

```bash
./start_backend.sh
```

This will:
- Activate Python virtual environment
- Start Flask server on `http://localhost:5000`
- Verify API key is loaded

### 2. Start the Frontend

```bash
python3 -m http.server 8000
```

Open: `http://localhost:8000`

### 3. Verify Backend is Running

```bash
curl http://localhost:5000/api/health
```

## 🔑 API Key Configuration

**Easy to check and change!**

### View Current API Key
```bash
cat backend/.env
```

### Change API Key
```bash
echo "GEMINI_API_KEY=your_new_key_here" > backend/.env
```

### Verify Change
```bash
curl http://localhost:5000/api/health
```

See full documentation in original file for more details.

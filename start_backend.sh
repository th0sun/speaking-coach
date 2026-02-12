#!/bin/bash

echo "🚀 Starting Speaking Coach Backend..."

cd backend

# Activate virtual environment
source venv/bin/activate

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Create backend/.env with:"
    echo "GEMINI_API_KEY=your_api_key_here"
    exit 1
fi

# Start server
echo "✅ Virtual environment activated"
echo "✅ Starting Flask server on http://localhost:5000"
python server.py

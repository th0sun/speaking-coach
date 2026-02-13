#!/bin/bash

# --- Color Definitions ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Starting Speaking Coach - Development Mode${NC}"

# 1. Kill any existing processes on ports 5001 (Backend) and 8000 (Frontend)
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null

# 2. Start Backend (in background)
echo -e "${BLUE}📡 Starting Backend Server (Port 5001)...${NC}"
cd backend
source venv/bin/activate
# Run server in background & save PID
python server.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready (simple sleep for now)
echo -e "${CYAN}⏳ Waiting for backend to initialize...${NC}"
sleep 3

# 3. Start Frontend (in background)
echo -e "${GREEN}🌐 Starting Frontend Server (Port 8000)...${NC}"
python3 -m http.server 8000 > frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Development Environment Ready!${NC}"
echo -e "   👉 Frontend: http://localhost:8000"
echo -e "   👉 Backend:  http://localhost:5001"
echo -e "${CYAN}📝 Logs available in backend.log and frontend.log${NC}"
echo -e "${BLUE}Press CTRL+C to stop servers${NC}"

# Open in default browser
open "http://localhost:8000"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait

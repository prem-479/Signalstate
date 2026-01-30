#!/bin/bash

# ============================================
# Signalstate - Quick Start Script
# Automated setup and launch
# ============================================

set -e  # Exit on error

echo "=========================================="
echo "Signalstate - Quick Start"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python is installed
echo "Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    echo "Please install Python 3.10+ from https://www.python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo -e "${GREEN}✓${NC} Python $PYTHON_VERSION found"

# Create directory structure if not exists
echo ""
echo "Setting up project structure..."
mkdir -p backend
mkdir -p frontend/{css,js}
mkdir -p docs
echo -e "${GREEN}✓${NC} Directory structure created"

# Setup backend
echo ""
echo "=========================================="
echo "Setting up Backend"
echo "=========================================="

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓${NC} Virtual environment created"
else
    echo -e "${YELLOW}⚠${NC} Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing Python dependencies..."
if [ -f "requirements.txt" ]; then
    pip install --quiet --upgrade pip
    pip install --quiet -r requirements.txt
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${RED}Error: requirements.txt not found${NC}"
    exit 1
fi

# Test imports
echo "Verifying installation..."
python3 << END
try:
    import cv2
    import mediapipe
    import fastapi
    import uvicorn
    print("${GREEN}✓${NC} All dependencies verified")
except ImportError as e:
    print(f"${RED}Error: Missing dependency - {e}${NC}")
    exit(1)
END

echo ""
echo "=========================================="
echo "Starting Services"
echo "=========================================="

# Start backend in background
echo "Starting FastAPI backend..."
python app.py &
BACKEND_PID=$!
echo -e "${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend is healthy"
else
    echo -e "${RED}Error: Backend failed to start${NC}"
    kill $BACKEND_PID
    exit 1
fi

# Start frontend
echo ""
echo "Starting frontend server..."
cd ../frontend

# Try to start frontend with available server
if command -v python3 &> /dev/null; then
    echo "Using Python HTTP server..."
    python3 -m http.server 8080 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"
elif command -v node &> /dev/null; then
    echo "Using npx http-server..."
    npx http-server -p 8080 --cors &
    FRONTEND_PID=$!
    echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"
else
    echo -e "${YELLOW}⚠${NC} No HTTP server available"
    echo "Please manually serve the frontend directory"
fi

# Wait for frontend to be ready
sleep 2

echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "Services running:"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:8080"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:8080 in your browser"
echo "  2. Accept the privacy notice"
echo "  3. Grant camera permissions"
echo "  4. Start detecting emotions!"
echo ""
echo "To stop services:"
echo "  Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "=========================================="

# Save PIDs for cleanup
echo "$BACKEND_PID" > /tmp/signalstate-backend.pid
echo "$FRONTEND_PID" > /tmp/signalstate-frontend.pid

# Wait for user interrupt
trap "echo ''; echo 'Shutting down services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Services stopped'; exit 0" INT TERM

# Keep script running
wait

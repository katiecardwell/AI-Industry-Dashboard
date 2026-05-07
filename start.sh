#!/usr/bin/env bash
# Start both the FastAPI backend and the Vite dev server together.
# Usage: ./start.sh

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Install Python deps if needed
if ! python3 -c "import fastapi" 2>/dev/null; then
  echo "Installing Python dependencies..."
  pip3 install -r backend/requirements.txt -q
fi

echo "Starting FastAPI backend on :8000..."
(cd "$PROJECT_DIR/backend" && uvicorn main:app --reload --port 8000) &
BACKEND_PID=$!

echo "Starting Vite dev server on :5173..."
(cd "$PROJECT_DIR" && npm run dev) &
VITE_PID=$!

trap "kill $BACKEND_PID $VITE_PID 2>/dev/null" EXIT INT TERM
wait

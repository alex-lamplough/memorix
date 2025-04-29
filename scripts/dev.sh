#!/bin/bash

# Start backend on port 3000
echo "🔵 Starting backend server on port 3000..."
cd backend && PORT=3000 npm run dev &
BACKEND_PID=$!

# Start frontend on port 5173
echo "🟢 Starting frontend on port 5173..."
cd .. && npm run dev &
FRONTEND_PID=$!

# Function to handle termination
cleanup() {
  echo "🛑 Stopping servers..."
  kill $BACKEND_PID $FRONTEND_PID
  exit 0
}

# Trap SIGINT and SIGTERM signals
trap cleanup SIGINT SIGTERM

# Keep script running
echo "✅ Both servers running. Press Ctrl+C to stop both."
wait 
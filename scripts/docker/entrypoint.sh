#!/bin/sh
set -e

echo "Starting frontend..."
node frontend/build &
FRONTEND_PID=$!

echo "Starting backend..."
cd backend && ./svelocker-backend &
BACKEND_PID=$!

# Handle shutdown signals
trap 'kill $FRONTEND_PID $BACKEND_PID; exit' SIGINT SIGTERM

# Wait for both processes to finish
wait $FRONTEND_PID $BACKEND_PID
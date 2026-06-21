#!/bin/bash
# start.sh — Start ngrok + backend, auto-publish the ngrok URL to GitHub Pages.
#
# Usage:
#   ./server/start.sh
#
# The API key is read from server/.env (API_FOOTBALL_KEY=...).
# For mock mode, set API_FOOTBALL_KEY=mock in server/.env.

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NGROK_PORT=5002
NGROK_INSPECTOR_PORT=4041
CONFIG_FILE="backend_config.json"

# Load API key from .env
ENV_FILE="$REPO_ROOT/server/.env"
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
fi

if [ -z "$API_FOOTBALL_KEY" ]; then
    echo "ERROR: API_FOOTBALL_KEY not set. Add it to server/.env"
    exit 1
fi

# Start backend in background
echo "Starting backend on port $NGROK_PORT..."
python3 "$REPO_ROOT/server/backend.py" &
BACKEND_PID=$!
sleep 2

# Start ngrok in background
echo "Starting ngrok tunnel..."
ngrok http $NGROK_PORT --log=stdout > /dev/null &
NGROK_PID=$!
sleep 3

# Get the public URL from ngrok's local API
NGROK_URL=$(curl -s http://localhost:$NGROK_INSPECTOR_PORT/api/tunnels 2>/dev/null | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    for t in data.get('tunnels', []):
        if t.get('proto') == 'https':
            print(t['public_url'])
            break
except: pass
")

if [ -z "$NGROK_URL" ]; then
    echo "ERROR: Could not get ngrok URL. Is port $NGROK_INSPECTOR_PORT available for ngrok inspector?"
    kill $BACKEND_PID $NGROK_PID 2>/dev/null
    exit 1
fi

echo ""
echo "=========================================="
echo "  ngrok URL: $NGROK_URL"
echo "=========================================="
echo ""

# Update backend_config.json locally
echo "{\"backend_url\": \"$NGROK_URL\"}" > "$REPO_ROOT/$CONFIG_FILE"

# Push to GitHub Pages
cd "$REPO_ROOT"
git add "$CONFIG_FILE"
git commit -m "config: update backend URL to $NGROK_URL" --allow-empty 2>/dev/null || true
git push 2>/dev/null || echo "WARNING: git push failed — update backend_config.json manually"

echo ""
echo "Login:  $NGROK_URL/login"
echo "Admin:  $NGROK_URL/admin"
echo ""
echo "Remember to add $NGROK_URL to Google OAuth authorized JavaScript origins"
echo ""
echo "Press Ctrl+C to stop everything."

# Wait and cleanup on exit
trap "kill $BACKEND_PID $NGROK_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait

#!/bin/bash
# start.sh — Start ngrok + backend, auto-publish the ngrok URL to GitHub Pages.
#
# Usage:
#   export API_FOOTBALL_KEY="your-key"
#   ./server/start.sh
#
# For mock mode:
#   export API_FOOTBALL_KEY="mock"
#   export API_FOOTBALL_URL="http://localhost:5003"
#   ./server/start.sh

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NGROK_PORT=5002
CONFIG_FILE="backend_config.json"

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
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
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
    echo "ERROR: Could not get ngrok URL. Is port 4040 available for ngrok inspector?"
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

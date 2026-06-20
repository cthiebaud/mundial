"""
backend.py — Flask backend for the Mundial app.

- Proxies API-Football (hides API key, caches responses)
- Google Sign-In authentication
- Admin page with live WebSocket updates on login/logout
- User login page

Usage:
    # Against real API:
    export API_FOOTBALL_KEY="your-key"
    python3 server/backend.py

    # Against local mock server:
    export API_FOOTBALL_KEY="mock"
    export API_FOOTBALL_URL="http://localhost:5003"
    python3 server/backend.py

Endpoints:
    GET  /api/live                → live WC fixtures
    GET  /api/lineups/<fixture_id> → lineups for a fixture
    POST /api/auth/google         → verify Google Sign-In token, return user info
    GET  /api/auth/me             → current user (from session)
    POST /api/auth/logout         → clear session
    GET  /login                   → user login page
    GET  /admin                   → admin page (live WebSocket updates)
    GET  /api/admin/users         → list all known users (admin only)

WebSocket events (admin):
    server → client: 'user_login'  {user}
    server → client: 'user_logout' {user}
"""

import os, time, sys, json
from pathlib import Path
from flask import Flask, jsonify, request, session, send_file
from flask_socketio import SocketIO

API_KEY = os.environ.get("API_FOOTBALL_KEY", "")
if not API_KEY:
    print("Set API_FOOTBALL_KEY environment variable first.")
    sys.exit(1)

API_BASE = os.environ.get("API_FOOTBALL_URL", "https://v3.football.api-sports.io")
GOOGLE_CLIENT_ID = "657438044008-qddq7m5mgk59k8qnhjpd6dalndqqb50e.apps.googleusercontent.com"
ADMIN_EMAILS = {"christophe.t60@gmail.com"}

import requests as req

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET", os.urandom(32))
socketio = SocketIO(app, cors_allowed_origins="*")

SERVER_DIR = Path(__file__).parent
USERS_FILE = SERVER_DIR / "users.json"

def _load_users():
    if USERS_FILE.exists():
        return json.loads(USERS_FILE.read_text())
    return {}

def _save_users(users):
    USERS_FILE.write_text(json.dumps(users, indent=2, ensure_ascii=False))

# ── API-Football proxy ───────────────────────────────────────────────────────

CACHE = {}
CACHE_TTL = 60

def cached_get(path, params):
    url = f"{API_BASE}{path}"
    key = f"{url}?{params}"
    now = time.time()
    if key in CACHE and now - CACHE[key]["t"] < CACHE_TTL:
        return CACHE[key]["data"]
    r = req.get(url, headers={"x-apisports-key": API_KEY}, params=params, timeout=10)
    r.raise_for_status()
    data = r.json().get("response", [])
    CACHE[key] = {"data": data, "t": now}
    return data

@app.after_request
def cors(response):
    origin = request.headers.get("Origin", "*")
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.route("/api/live")
def live():
    fixtures = cached_get("/fixtures", {"live": "all"})
    wc = [f for f in fixtures if f["league"]["name"] == "World Cup"]
    return jsonify(wc)

@app.route("/api/lineups/<int:fixture_id>")
def lineups(fixture_id):
    data = cached_get("/fixtures/lineups", {"fixture": fixture_id})
    return jsonify(data)

# ── Auth ─────────────────────────────────────────────────────────────────────

@app.route("/api/auth/google", methods=["POST"])
def auth_google():
    token = request.json.get("credential")
    if not token:
        return jsonify({"error": "missing credential"}), 400

    r = req.get("https://oauth2.googleapis.com/tokeninfo", params={"id_token": token}, timeout=5)
    if r.status_code != 200:
        return jsonify({"error": "invalid token"}), 401

    info = r.json()
    if info.get("aud") != GOOGLE_CLIENT_ID:
        return jsonify({"error": "wrong audience"}), 401

    user = {
        "email": info["email"],
        "name": info.get("name", ""),
        "picture": info.get("picture", ""),
        "last_login": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    session["user"] = user

    users = _load_users()
    users[user["email"]] = user
    _save_users(users)

    socketio.emit("user_login", user)

    return jsonify({"user": user, "admin": user["email"] in ADMIN_EMAILS})

@app.route("/api/auth/me")
def auth_me():
    user = session.get("user")
    if not user:
        return jsonify({"user": None}), 200
    return jsonify({"user": user, "admin": user["email"] in ADMIN_EMAILS})

@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    user = session.pop("user", None)
    if user:
        socketio.emit("user_logout", user)
    return jsonify({"ok": True})

# ── Pages ────────────────────────────────────────────────────────────────────

@app.route("/login")
def login_page():
    return send_file(SERVER_DIR / "login.html")

@app.route("/admin")
def admin_page():
    return send_file(SERVER_DIR / "admin.html")

@app.route("/api/admin/users")
def admin_users():
    user = session.get("user")
    if not user or user["email"] not in ADMIN_EMAILS:
        return jsonify({"error": "forbidden"}), 403
    return jsonify(_load_users())

if __name__ == "__main__":
    print(f"Proxy → {API_BASE}")
    socketio.run(app, host="0.0.0.0", port=5002, allow_unsafe_werkzeug=True)

const HOME_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.4498 10.275L11.9998 3.1875L2.5498 10.275L2.9998 11.625H3.7498V20.25H20.2498V11.625H20.9998L21.4498 10.275ZM5.2498 18.75V10.125L11.9998 5.0625L18.7498 10.125V18.75H14.9999V14.3333L14.2499 13.5833H9.74988L8.99988 14.3333V18.75H5.2498ZM10.4999 18.75H13.4999V15.0833H10.4999V18.75Z" fill="#999"/></svg>`;

class MundialAuthBar extends HTMLElement {
  constructor() {
    super();
    this.BACKEND = '';
  }

  connectedCallback() {
    this.innerHTML = `
<nav class="navbar navbar-light bg-white border-bottom py-0 px-2" style="position:fixed;top:0;left:0;right:0;z-index:1050;height:32px">
  <div class="container-xxl d-flex align-items-center px-1">
    <a href="/" class="text-muted text-decoration-none d-flex align-items-center" aria-label="Home" style="line-height:0">${HOME_ICON}</a>
    <a data-ref="live-link" href="wc2026_live_game.html" class="text-muted small text-decoration-none ms-3">Live game</a>
    <div class="d-flex align-items-center gap-2 ms-auto">
      <a data-ref="admin-link" href="#" target="_blank" class="text-muted small text-decoration-none d-none">Admin</a>
      <button data-ref="sign-in" class="btn btn-link btn-sm text-muted p-0" style="font-size:11px;text-decoration:none">sign in</button>
      <div data-ref="signed-in" class="d-none d-flex align-items-center gap-1">
        <img data-ref="pic" class="rounded-circle" width="22" height="22" style="cursor:default" alt="" referrerpolicy="no-referrer">
        <button data-ref="sign-out" class="btn btn-link btn-sm text-muted p-0" style="font-size:11px;text-decoration:none">sign out</button>
      </div>
    </div>
  </div>
</nav>`;

    this._refs = {};
    this.querySelectorAll('[data-ref]').forEach(el => {
      this._refs[el.dataset.ref] = el;
    });

    this._init();
  }

  _el(ref) { return this._refs[ref]; }

  _showOffline(reason) {
    console.warn('[auth-bar]', reason);
    this.innerHTML = `
<div style="position:fixed;top:0;left:0;right:0;z-index:1050;height:32px;background:#f5f2ec;border-bottom:1px solid #dee2e6;display:flex;align-items:center;justify-content:center">
  <span style="font-size:11px;color:#999">${reason}</span>
</div>`;
    this.style.display = '';
    const next = this.nextElementSibling;
    if (next) next.style.marginTop = '32px';
  }

  async _init() {
    this.style.display = 'none';

    try {
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        this.BACKEND = 'http://localhost:5002';
      } else {
        const cfg = await fetch('./backend_config.json').then(r => r.json());
        this.BACKEND = cfg.backend_url;
      }
      if (!this.BACKEND) {
        this._showOffline('Backend not configured');
        return;
      }
      await fetch(this.BACKEND + '/api/auth/me', {
        credentials: 'include',
        signal: AbortSignal.timeout(3000),
        headers: {'ngrok-skip-browser-warning': '1'}
      });
    } catch (err) {
      const detail = err.name === 'TimeoutError' ? 'Backend timed out' : `Backend unreachable (${this.BACKEND || 'no URL'})`;
      this._showOffline(detail);
      return;
    }

    this.style.display = '';
    const next = this.nextElementSibling;
    if (next) next.style.marginTop = '32px';
    this.dispatchEvent(new CustomEvent('auth-bar-ready', {bubbles: true}));

    const stored = localStorage.getItem('mundial_user');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this._showUser(data.user ?? data, data.admin ?? false);
      } catch {}
    }

    this._el('sign-in').addEventListener('click', () => {
      window.open(this.BACKEND + '/login', 'mundial_login', 'width=420,height=500,left=200,top=200');
    });

    window.addEventListener('message', e => {
      if (e.data?.type === 'mundial_auth' && e.data.user) {
        localStorage.setItem('mundial_user', JSON.stringify(e.data));
        localStorage.setItem('mundial_sid', e.data.sid ?? '');
        this._showUser(e.data.user, e.data.admin);
      }
      if (e.data?.type === 'mundial_kicked') {
        this._signOut();
      }
    });

    this._el('sign-out').addEventListener('click', async () => {
      const sid = localStorage.getItem('mundial_sid');
      const raw = localStorage.getItem('mundial_user');
      const email = raw ? (JSON.parse(raw).user ?? JSON.parse(raw)).email : null;
      await fetch(this.BACKEND + '/api/auth/logout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({sid, email})
      }).catch(() => {});
      this._signOut();
    });

    this._connectWebSocket();
  }

  _showUser(user, isAdmin) {
    this._el('sign-in').classList.add('d-none');
    this._el('signed-in').classList.remove('d-none');
    this._el('pic').src = user.picture;
    this._el('pic').title = user.name;
    if (isAdmin) {
      this._el('admin-link').classList.remove('d-none');
      this._el('admin-link').href = this.BACKEND + '/admin';
    }
  }

  _signOut() {
    localStorage.removeItem('mundial_user');
    localStorage.removeItem('mundial_sid');
    this._el('signed-in').classList.add('d-none');
    this._el('sign-in').classList.remove('d-none');
    this._el('admin-link').classList.add('d-none');
  }

  _connectWebSocket() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/socket.io-client@4/dist/socket.io.min.js';
    script.onload = () => {
      const sock = io(this.BACKEND, {transports: ['websocket']});
      sock.on('user_kicked', ({email, sid: kickedSid}) => {
        const mySid = localStorage.getItem('mundial_sid');
        const raw = localStorage.getItem('mundial_user');
        if (!raw) return;
        try {
          const data = JSON.parse(raw);
          const cur = (data.user ?? data).email;
          if (kickedSid && mySid === kickedSid) this._signOut();
          else if (!kickedSid && cur === email) this._signOut();
        } catch {}
      });
    };
    document.head.appendChild(script);
  }
}

customElements.define('mundial-auth-bar', MundialAuthBar);

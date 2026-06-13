/* ===================================================================
   CSM — Shared JS
   api.js  ·  auth helpers  ·  UI utilities  ·  subjects config
   =================================================================== */

// ─── Config ──────────────────────────────────────────────────────────────────

const API_BASE = 'https://csm-j182.onrender.com/api'; // Change to your deployed backend URL

const SUBJECTS = [
  { id: 'java',    name: 'Java Programming',           tag: 'JAVA',    semester: 5 },
  { id: 'ngdb',    name: 'New Generation Database',    tag: 'NGDB',    semester: 5 },
  { id: 'testing', name: 'Software Testing',           tag: 'TEST',    semester: 5 },
  { id: 'cyber',   name: 'Cyber Security',             tag: 'CYBER',   semester: 5 },
  { id: 'erp',     name: 'ERP',                        tag: 'ERP',     semester: 5 },
];

const CATEGORIES = ['Notes', 'PPTs', 'Assignments'];

const SEMESTERS = [
  { num: 1, label: 'Semester 1', active: false },
  { num: 2, label: 'Semester 2', active: false },
  { num: 3, label: 'Semester 3', active: false },
  { num: 4, label: 'Semester 4', active: false },
  { num: 5, label: 'Semester 5', active: true  },
  { num: 6, label: 'Semester 6', active: false },
];

// ─── API Client ───────────────────────────────────────────────────────────────

const API = {
  async _fetch(path, options = {}) {
    const token = authGetToken();
    const headers = { ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Don't set Content-Type for FormData — browser handles it
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Request failed');
    return data;
  },

  // Auth
  login:  (body)           => API._fetch('/auth/login',  { method: 'POST', body: JSON.stringify(body) }),
  signup: (body)           => API._fetch('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  getMe:  ()               => API._fetch('/auth/me'),

  // Materials — public
  getMaterials: (params = {}) => API._fetch('/materials?' + new URLSearchParams(params)),
  getRecent:    (semester = 5) => API._fetch(`/materials/recent?semester=${semester}`),
  getMaterial:  (id)       => API._fetch(`/materials/${id}`),

  // Materials — faculty
  getMyMaterials: ()       => API._fetch('/materials/faculty/mine'),
  uploadMaterial: (form)   => API._fetch('/materials', { method: 'POST', body: form }),
  updateMaterial: (id, body) => API._fetch(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMaterial: (id)     => API._fetch(`/materials/${id}`, { method: 'DELETE' }),
};

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

const AUTH_KEY = 'csm_faculty';

function authGetToken()   { return (authGetSession() || {}).token || null; }
function authGetSession() { try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; } }
function authSetSession(token, faculty) { localStorage.setItem(AUTH_KEY, JSON.stringify({ token, faculty })); }
function authClear()      { localStorage.removeItem(AUTH_KEY); }
function authIsLoggedIn() { return !!authGetToken(); }
function authGetFaculty() { return (authGetSession() || {}).faculty || null; }

// ─── Toast ────────────────────────────────────────────────────────────────────

let toastTimer = null;
function showToast(msg, duration = 3000) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

// ─── Stamp Overlay ────────────────────────────────────────────────────────────

function showStamp(headline, sub, callback, delay = 1800) {
  let overlay = document.getElementById('stamp-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'stamp-overlay';
    overlay.className = 'stamp-overlay';
    overlay.innerHTML = `
      <div class="stamp-card">
        <div class="ruled"></div>
        <div class="stamp-mark" id="stamp-mark-text"></div>
        <div class="stamp-sub" id="stamp-sub-text"></div>
      </div>`;
    document.body.appendChild(overlay);
  }
  document.getElementById('stamp-mark-text').innerHTML = headline;
  document.getElementById('stamp-sub-text').textContent = sub;
  overlay.classList.add('show');
  setTimeout(() => {
    overlay.classList.remove('show');
    if (callback) callback();
  }, delay);
}

// ─── Nav Builder ─────────────────────────────────────────────────────────────

function buildNav(activePage) {
  const nav = document.getElementById('topnav');
  if (!nav) return;
  const fac = authGetFaculty();
  const userHtml = fac
    ? `<span class="nav-user">Signed in as <strong>${fac.name}</strong></span>
       <button class="btn btn-ghost btn-sm" id="nav-logout">Log Out</button>`
    : `<a href="faculty.html" class="nav-faculty ${activePage === 'faculty' ? 'active' : ''}">Faculty ▸</a>`;

  nav.innerHTML = `
    <div class="wrap">
      <div class="topnav-inner">
        <a href="index.html" class="nav-logo">CSM</a>
        <button class="nav-toggle" id="nav-toggle" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
        <nav class="nav-links" id="nav-links">
          <a href="index.html"    class="${activePage === 'home'     ? 'active' : ''}">Home</a>
          <a href="browse.html"   class="${activePage === 'browse'   ? 'active' : ''}">Browse</a>
          <a href="faculty.html"  class="${activePage === 'faculty'  ? 'active' : ''}">${fac ? 'Dashboard' : 'Faculty'}</a>
          ${userHtml}
        </nav>
      </div>
    </div>`;

  // Mobile toggle
  document.getElementById('nav-toggle').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
  });

  // Logout
  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authClear();
      showToast('Signed out — the drawer is locked.');
      setTimeout(() => window.location.href = 'index.html', 900);
    });
  }
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────

function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function subjectById(id)     { return SUBJECTS.find(s => s.id === id) || { name: id, tag: id.toUpperCase(), id }; }
function formatDate(iso)     { return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
function formatSize(bytes)   {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
function extOf(name = '')    { return name.split('.').pop().toLowerCase(); }
function debounce(fn, ms)    { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

/* script.js — LOGIN / SESSION / HELPERS (overwrite existing) */

/*
  Behavior:
  - index.html login uses authenticate() which checks /data/users.json if available,
    otherwise falls back to built-in default admin/admin123.
  - On successful login, sets sessionStorage 'sv_user' = JSON.stringify({username, name, role, department})
  - checkAuth() used in internal pages to require login.
  - logout() clears session.
*/

const FALLBACK_USER = { username: "admin", password: "admin123", name: "Administrator", role: "admin", department: "Admin" };

async function loadUsers(){
  try{
    const res = await fetch('/data/users.json', {cache: "no-store"});
    if(!res.ok) throw new Error('no users.json');
    const arr = await res.json();
    return arr.map(u=>({
      username: u.username,
      password_b64: u.password_b64 || '',
      name: u.name || u.username,
      role: u.role || 'user',
      department: u.department || ''
    }));
  }catch(e){
    return null;
  }
}

// helper: base64 encode
function b64Encode(str){ try { return btoa(str); } catch(e){ return ''; } }
function b64Decode(s){ try { return atob(s); } catch(e){ return s || ''; } }

async function authenticate(username, password){
  const users = await loadUsers();
  if(users && users.length){
    const found = users.find(u=> u.username === username);
    if(found && found.password_b64 === b64Encode(password)){
      return { username: found.username, name: found.name, role: found.role, department: found.department };
    }
  }
  // fallback check
  if(username === FALLBACK_USER.username && password === FALLBACK_USER.password){
    return { username: FALLBACK_USER.username, name: FALLBACK_USER.name, role: FALLBACK_USER.role, department: FALLBACK_USER.department };
  }
  return null;
}

/* index.html login form handler (call on submit) */
async function handleLoginForm(e){
  if(e && e.preventDefault) e.preventDefault();
  const uname = document.getElementById('username')?.value?.trim() || '';
  const pass = document.getElementById('password')?.value || '';
  if(!uname || !pass){ alert('Enter username & password'); return; }

  const auth = await authenticate(uname, pass);
  if(auth){
    sessionStorage.setItem('sv_user', JSON.stringify(auth));
    // redirect to internal dashboard (do not change home.html)
    window.location.href = 'pages/dashboard.html';
  } else {
    alert('Invalid username or password');
  }
}

/* Logout */
function logout(){
  sessionStorage.removeItem('sv_user');
  // if current page is under pages/ go to root login
  window.location.href = '/';
}

/* Get current user object or null */
function currentUser(){
  try { return JSON.parse(sessionStorage.getItem('sv_user')); } catch(e){ return null; }
}

/* Must be called on internal pages that require login */
function checkAuth(requireAdmin=false){
  const user = currentUser();
  if(!user){
    // redirect to root login (index.html)
    window.location.href = '/';
    return false;
  }
  if(requireAdmin && user.role !== 'admin'){
    alert('Admin access required');
    // optionally redirect to dashboard
    window.location.href = 'dashboard.html';
    return false;
  }
  // show username if element exists
  const nameEl = document.getElementById('sv_user_name');
  if(nameEl) nameEl.textContent = user.name + (user.department ? ' ('+user.department+')' : '');
  return true;
}

/* Utility: fill demo login (call on demo click) */
function demoLoginFill(){
  const u = document.getElementById('username');
  const p = document.getElementById('password');
  if(u) u.value = FALLBACK_USER.username;
  if(p) p.value = FALLBACK_USER.password;
}

/* Small helper: format date */
function formatDT(d){
  if(!d) return '';
  const dd = new Date(d);
  return dd.toLocaleString();
}

/* Export minimal functions to global */
window.handleLoginForm = handleLoginForm;
window.logout = logout;
window.checkAuth = checkAuth;
window.demoLoginFill = demoLoginFill;
window.currentUser = currentUser;
window.formatDT = formatDT;

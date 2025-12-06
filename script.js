/* script.js - shared auth + header + clock logic
   Put this file in project root: /Siddhivinayak_Digital/script.js
*/

const BASE = "https://nil4567.github.io/Siddhivinayak_Digital";

// Hardcoded (simple) credentials — change as needed
const validUser = {
  username: "admin",
  password: "12345",
  name: "Admin User"
};

// ---------- Login (called from login page) ----------
function login() {
  const userEl = document.getElementById("username");
  const passEl = document.getElementById("password");
  const errEl  = document.getElementById("error");

  if (!userEl || !passEl || !errEl) return;

  const user = userEl.value.trim();
  const pass = passEl.value;

  if (user === validUser.username && pass === validUser.password) {
    // store login state
    localStorage.setItem("loggedIn", "yes");
    localStorage.setItem("username", validUser.name);
    // redirect to dashboard (full GitHub Pages URL to avoid 404)
    window.location.href = `${BASE}/pages/dashboard.html`;
  } else {
    errEl.textContent = "Invalid username or password!";
    errEl.style.display = "block";
  }
}

// ---------- Check login (include on pages that require auth) ----------
function checkLogin() {
  if (localStorage.getItem("loggedIn") !== "yes") {
    // redirect to login page
    window.location.href = `${BASE}/pages/login.html`;
  }
}

// ---------- Logout ----------
function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("username");
  window.location.href = `${BASE}/pages/login.html`;
}

// ---------- Header init: show username + logout button visibility ----------
function initHeader() {
  // elements we expect in your header/topbar
  const nameEl = document.getElementById("sv_user_name") || document.getElementById("showUser");
  const logoutBtn = document.getElementById("logoutBtn");
  const logged = localStorage.getItem("loggedIn") === "yes";
  const username = localStorage.getItem("username") || "";

  if (nameEl) {
    nameEl.textContent = logged ? username : "";
    nameEl.style.display = logged ? "inline-block" : "none";
    nameEl.style.marginRight = "10px";
  }

  if (logoutBtn) {
    logoutBtn.style.display = logged ? "inline-block" : "none";
  }
}

// ---------- Live clock ----------
let _clockTimer = null;
function startLiveClock() {
  const el = document.getElementById("liveTime");
  if (!el) return;
  function tick() {
    const now = new Date();
    // you can customise formatting
    el.textContent = now.toLocaleDateString() + " " + now.toLocaleTimeString();
  }
  tick();
  if (_clockTimer) clearInterval(_clockTimer);
  _clockTimer = setInterval(tick, 1000);
}

// ---------- Auto hook for login form if it's present ----------
document.addEventListener("DOMContentLoaded", function () {
  // Auto attach submit handler for login form if present
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      login();
    });
  }

  // Initialize header and clock on any page where these elements exist
  initHeader();
  startLiveClock();
});

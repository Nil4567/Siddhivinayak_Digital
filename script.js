/* script.js - shared auth + header + clock logic
   Put this file in project root: /Siddhivinayak_Digital/script.js
*/

const BASE = "https://nil4567.github.io/Siddhivinayak_Digital";

// Hardcoded (simple) credentials — change as needed
const validUser = {
  username: "admin",
  password: "admin123",  // FIXED
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

    // redirect to dashboard (full GitHub Pages URL)
    window.location.href = `${BASE}/pages/dashboard.html`;
  } else {
    errEl.textContent = "Invalid username or password!";
    errEl.style.display = "block";
  }
}

// ---------- Check login ----------
function checkLogin() {
  if (localStorage.getItem("loggedIn") !== "yes") {
    window.location.href = `${BASE}/pages/login.html`;
  }
}

// ---------- Logout ----------
function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("username");
  window.location.href = `${BASE}/pages/login.html`;
}

// ---------- Header init: show username ----------
function initHeader() {
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
    el.textContent = now.toLocaleDateString() + " " + now.toLocaleTimeString();
  }
  tick();
  if (_clockTimer) clearInterval(_clockTimer);
  _clockTimer = setInterval(tick, 1000);
}

// ---------- Auto hook for login form ----------
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      login();
    });
  }

  initHeader();
  startLiveClock();
});

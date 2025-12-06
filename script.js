<script src="../data/config.js"></script>
<script src="../script.js"></script>

/* script.js - Auth + Header + Clock + Safe GitHub Job Dispatch */

/* --------------------------------------------------
   BASE URL FOR REDIRECTION
-------------------------------------------------- */
const BASE = "https://nil4567.github.io/Siddhivinayak_Digital";

/* --------------------------------------------------
   LOGIN CREDENTIALS
-------------------------------------------------- */
const validUser = {
  username: "admin",
  password: "admin123",
  name: "Admin User"
};

/* --------------------------------------------------
   LOGIN FUNCTION
-------------------------------------------------- */
function login() {
  const userEl = document.getElementById("username");
  const passEl = document.getElementById("password");
  const errEl  = document.getElementById("error");

  if (!userEl || !passEl || !errEl) return;

  const user = userEl.value.trim();
  const pass = passEl.value;

  if (user === validUser.username && pass === validUser.password) {
    localStorage.setItem("loggedIn", "yes");
    localStorage.setItem("username", validUser.name);
    window.location.href = `${BASE}/pages/dashboard.html`;
  } else {
    errEl.textContent = "Invalid username or password!";
    errEl.style.display = "block";
  }
}

/* --------------------------------------------------
   CHECK LOGIN
-------------------------------------------------- */
function checkLogin() {
  if (localStorage.getItem("loggedIn") !== "yes") {
    window.location.href = `${BASE}/pages/login.html`;
  }
}

/* --------------------------------------------------
   LOGOUT
-------------------------------------------------- */
function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("username");
  window.location.href = `${BASE}/pages/login.html`;
}

/* --------------------------------------------------
   SHOW USERNAME IN HEADER
-------------------------------------------------- */
function initHeader() {
  const nameEl = document.getElementById("sv_user_name");
  const logoutBtn = document.getElementById("logoutBtn");

  const logged = localStorage.getItem("loggedIn") === "yes";
  const username = localStorage.getItem("username") || "";

  if (nameEl) {
    nameEl.textContent = logged ? username : "";
    nameEl.style.display = logged ? "inline-block" : "none";
  }

  if (logoutBtn) {
    logoutBtn.style.display = logged ? "inline-block" : "none";
  }
}

/* --------------------------------------------------
   LIVE CLOCK
-------------------------------------------------- */
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

/* --------------------------------------------------
   SAVE JOB (SAFE - REPO DISPATCH)
-------------------------------------------------- */
async function saveJobToGitHub(newJob) {

  // Token must come ONLY from config.js (ignored in repo)
  if (typeof GITHUB_SITE_KEY === "undefined" || !GITHUB_SITE_KEY) {
    console.error("❌ ERROR: GITHUB_SITE_KEY missing. Create data/config.js");
    return false;
  }

  const dispatchUrl =
    "https://api.github.com/repos/Nil4567/Siddhivinayak_Digital/dispatches";

  const res = await fetch(dispatchUrl, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": "Bearer " + GITHUB_SITE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_type: "add-job",
      client_payload: { job: newJob }
    })
  });

  return res.ok;
}

/* --------------------------------------------------
   AUTO INIT
-------------------------------------------------- */
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

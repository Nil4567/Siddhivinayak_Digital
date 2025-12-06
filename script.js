/* script.js - Shared Auth + Header + Clock + GitHub Database */

// --------------------------------------------------
// BASE URL FOR REDIRECTION
// --------------------------------------------------
const BASE = "https://nil4567.github.io/Siddhivinayak_Digital";

// --------------------------------------------------
// LOGIN CREDENTIALS
// --------------------------------------------------
const validUser = {
  username: "admin",
  password: "admin123",
  name: "Admin User"
};

// --------------------------------------------------
// LOGIN FUNCTION
// --------------------------------------------------
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

// --------------------------------------------------
// CHECK LOGIN
// --------------------------------------------------
function checkLogin() {
  if (localStorage.getItem("loggedIn") !== "yes") {
    window.location.href = `${BASE}/pages/login.html`;
  }
}

// --------------------------------------------------
// LOGOUT
// --------------------------------------------------
function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("username");
  window.location.href = `${BASE}/pages/login.html`;
}

// --------------------------------------------------
// SHOW USERNAME IN HEADER
// --------------------------------------------------
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

// --------------------------------------------------
// LIVE CLOCK
// --------------------------------------------------
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

// --------------------------------------------------
// SAVE JOB TO GITHUB DATABASE (NEW)
// --------------------------------------------------
async function saveJobToGitHub(newJob) {
  const token = "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";  // <<< CHANGE THIS
  const repoOwner = "Nil4567";
  const repoName = "Siddhivinayak_Digital";
  const filePath = "data/jobs.json";

  // 1. GET existing file
  const getRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const fileData = await getRes.json();
  const oldContent = fileData.content ? atob(fileData.content) : "[]";
  const jobs = JSON.parse(oldContent);

  // 2. ADD new job
  jobs.push(newJob);

  // 3. ENCODE updated JSON
  const updatedContent = btoa(JSON.stringify(jobs, null, 2));

  // 4. UPLOAD updated file
  const commitRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
    method: "PUT",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Add new job entry",
      content: updatedContent,
      sha: fileData.sha
    })
  });

  return commitRes.ok;
}

// --------------------------------------------------
// AUTO INIT
// --------------------------------------------------
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

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
    name: "Admin User",
    role: "admin" // Added role for queue management logic
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
        // Store multiple authentication details
        localStorage.setItem("loggedIn", "yes");
        localStorage.setItem("username", validUser.name);
        localStorage.setItem("sv_user_role", validUser.role); // Store the role
        
        // Use BASE URL for robust redirection
        window.location.href = `${BASE}/pages/dashboard.html`;
    } else {
        errEl.textContent = "Invalid username or password!";
        errEl.style.display = "block";
    }
}

/* --------------------------------------------------
    CHECK LOGIN (for login.html to redirect if already logged in)
-------------------------------------------------- */
function checkLogin() {
    if (localStorage.getItem("loggedIn") === "yes") {
        // Use BASE URL for robust redirection
        window.location.href = `${BASE}/pages/dashboard.html`;
    }
}

/* --------------------------------------------------
    CHECK AUTH (NEW - for protecting internal pages like dashboard/queue)
-------------------------------------------------- */
function checkAuth() {
    if (localStorage.getItem("loggedIn") !== "yes") {
        // Use BASE URL for robust redirection
        window.location.href = `${BASE}/pages/login.html`;
    }
    // Also initialize the header if the page is authenticated
    initHeader();
}

/* --------------------------------------------------
    LOGOUT (FIXED: Uses BASE URL)
-------------------------------------------------- */
function logout() {
    // Clear all authentication-related items
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("sv_user_role");
    
    // Use BASE URL for robust redirection
    window.location.href = `${BASE}/pages/login.html`;
}

/* --------------------------------------------------
    SHOW USERNAME IN HEADER
-------------------------------------------------- */
function initHeader() {
    const nameEl = document.getElementById("sv_user_name");
    const logoutBtn = document.querySelector(".topbar .controls .btn[onclick='logout()']");
    
    // We rely on 'loggedIn' status which is checked in checkAuth()
    const logged = localStorage.getItem("loggedIn") === "yes";
    const username = localStorage.getItem("username") || "";

    if (nameEl) {
        nameEl.textContent = logged ? username : "";
        // Keep display logic simple by checking the logged status
        nameEl.style.display = logged ? "inline-block" : "none";
    }

    // Since the button is part of the HTML structure, we only need to ensure
    // the name is present if logged in. The visibility of the button is controlled
    // by the logic in the HTML structure.
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

    // NOTE: initHeader() is now primarily called by checkAuth() on authenticated pages
    // and indirectly by checkLogin() on the login page (via DOMContentLoaded).
    // We only need to call it directly here if the page is NOT using checkAuth()/checkLogin()
    // but relies on the header being populated.
    
    startLiveClock();
});

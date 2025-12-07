/* script.js - Auth + Roles + Header + Clock + Dispatch + Manager Management */

/* --------------------------------------------------
    BASE URL FOR REDIRECTION
-------------------------------------------------- */
const BASE = "https://nil4567.github.io/Siddhivinayak_Digital";

/* --------------------------------------------------
    ROLES AND PERMISSIONS DEFINITION 🔑
    Defines which user role can access which pages.
-------------------------------------------------- */
const ACCESS_PERMISSIONS = {
    // Admin: Full access to everything
    'admin': ['dashboard.html', 'job-entry.html', 'job-queue.html', 'customers.html', 'expenses.html', 'reports.html', 'settings.html'],
    // Manager: Access to operational pages only (can't see global settings/reports)
    'manager': ['dashboard.html', 'job-entry.html', 'job-queue.html', 'customers.html', 'expenses.html'],
    // Viewer: Can only see the dashboard and queue (read-only)
    'viewer': ['dashboard.html', 'job-queue.html', 'customers.html']
};

/* --------------------------------------------------
    LOGIN CREDENTIALS (You can add more users here later, or move to settings)
-------------------------------------------------- */
// NOTE: For security in a real system, do not store passwords in plaintext JS.
const USER_CREDENTIALS = [
    { username: "admin", password: "admin123", name: "Admin User", role: "admin" },
    { username: "ganesh", password: "ganesh123", name: "Ganesh Sharma", role: "manager" },
    { username: "pooja", password: "pooja456", name: "Pooja Singh", role: "viewer" }
];

/* --------------------------------------------------
    MANAGER/USER MANAGEMENT FUNCTIONS
    Stores an array of manager names for job assignment dropdown.
-------------------------------------------------- */
const MANAGER_STORAGE_KEY = 'sv_managers';

function initManagers() {
    let managers = JSON.parse(localStorage.getItem(MANAGER_STORAGE_KEY));
    if (!managers || managers.length === 0) {
        // Initialize from the list of users who are not just 'viewer'
        const initialManagers = USER_CREDENTIALS
            .filter(user => user.role !== 'viewer')
            .map(user => user.name);
            
        // Ensure 'Admin User' is always present
        if (!initialManagers.includes('Admin User')) {
             initialManagers.unshift('Admin User');
        }

        managers = [...new Set(initialManagers)].sort((a, b) => {
            if (a === 'Admin User') return -1;
            return a.localeCompare(b);
        });

        localStorage.setItem(MANAGER_STORAGE_KEY, JSON.stringify(managers));
    }
}

function getManagers() {
    initManagers(); 
    return JSON.parse(localStorage.getItem(MANAGER_STORAGE_KEY));
}


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
    
    const validUser = USER_CREDENTIALS.find(u => u.username === user && u.password === pass);

    if (validUser) {
        // Store user details
        localStorage.setItem("loggedIn", "yes");
        localStorage.setItem("username", validUser.name);
        localStorage.setItem("sv_user_role", validUser.role);
        
        initManagers();
        
        // Redirect to the dashboard
        window.location.href = `${BASE}/pages/dashboard.html`;
    } else {
        errEl.textContent = "Invalid username or password!";
        errEl.style.display = "block";
    }
}

/* --------------------------------------------------
    ACCESS CONTROL CHECK 🛑 (New core function)
-------------------------------------------------- */
function checkAccess() {
    const userRole = localStorage.getItem("sv_user_role");
    const currentPage = window.location.pathname.split('/').pop();
    
    // If user is not logged in, redirect them immediately (handled by checkAuth)
    if (!userRole) return; 

    const allowedPages = ACCESS_PERMISSIONS[userRole] || [];

    if (!allowedPages.includes(currentPage)) {
        console.error(`Access Denied: Role "${userRole}" cannot access ${currentPage}`);
        // Redirect to their default landing page (dashboard)
        window.location.href = `${BASE}/pages/dashboard.html`;
        alert("Access Denied: You do not have permission to view this page.");
    }
}


/* --------------------------------------------------
    AUTH FUNCTIONS
-------------------------------------------------- */
function checkLogin() {
    if (localStorage.getItem("loggedIn") === "yes") {
        window.location.href = `${BASE}/pages/dashboard.html`;
    }
}

function checkAuth() {
    if (localStorage.getItem("loggedIn") !== "yes") {
        window.location.href = `${BASE}/index.html`;
    }
    // Perform access check and header initialization only if authenticated
    checkAccess();
    initHeader();
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("sv_user_role");
    window.location.href = `${BASE}/index.html`;
}


/* --------------------------------------------------
    HEADER & CLOCK
-------------------------------------------------- */
function initHeader() {
    const nameEl = document.getElementById("sv_user_name");
    const logged = localStorage.getItem("loggedIn") === "yes";
    const username = localStorage.getItem("username") || "";

    if (nameEl) {
        nameEl.textContent = logged ? username : "";
        nameEl.style.display = logged ? "inline-block" : "none";
    }
}

let _clockTimer = null;
function startLiveClock() {
    const el = document.getElementById("liveTime");
    if (!el) return;
    function tick() {
        const now = new Date();
        el.textContent = now.toLocaleDateString('en-IN') + " " + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    tick();
    if (_clockTimer) clearInterval(_clockTimer);
    _clockTimer = setInterval(tick, 1000);
}


/* --------------------------------------------------
    SAVE JOB/EXPENSE (REPO DISPATCH)
-------------------------------------------------- */
// NOTE: These rely on GITHUB_SITE_KEY defined in data/config.js
async function saveJobToGitHub(newJob) {
    if (typeof GITHUB_SITE_KEY === "undefined" || !GITHUB_SITE_KEY) {
        console.error("❌ ERROR: GITHUB_SITE_KEY missing.");
        return false;
    }
    const dispatchUrl = "https://api.github.com/repos/Nil4567/Siddhivinayak_Digital/dispatches";
    const res = await fetch(dispatchUrl, {
        method: "POST",
        headers: { "Accept": "application/vnd.github+json", "Authorization": "Bearer " + GITHUB_SITE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "add-job", client_payload: { job: newJob } })
    });
    return res.ok;
}

async function saveExpenseToGitHub(newExpense) {
    if (typeof GITHUB_SITE_KEY === "undefined" || !GITHUB_SITE_KEY) {
        console.error("❌ ERROR: GITHUB_SITE_KEY missing.");
        return false;
    }
    const dispatchUrl = "https://api.github.com/repos/Nil4567/Siddhivinayak_Digital/dispatches";
    const res = await fetch(dispatchUrl, {
        method: "POST",
        headers: { "Accept": "application/vnd.github+json", "Authorization": "Bearer " + GITHUB_SITE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "add-expense", client_payload: { expense: newExpense } })
    });
    return res.ok;
}


/* --------------------------------------------------
    AUTO INIT
-------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
    
    // Handle form submission on the login page
    const form = document.getElementById("loginForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            login();
        });
    }
    
    startLiveClock();
});

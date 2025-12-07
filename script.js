/* script.js - Auth + Roles + Header + Clock + Dispatch + Centralized User/Manager Management */

/* --------------------------------------------------
    BASE URL FOR REDIRECTION
-------------------------------------------------- */
const BASE = "https://nil4567.github.io/Siddhivinayak_Digital";

/* --------------------------------------------------
    LOCAL STORAGE KEYS
-------------------------------------------------- */
const MANAGER_STORAGE_KEY = 'sv_managers'; // For job assignment dropdown
const USER_CREDENTIALS_KEY = 'sv_user_credentials'; // For secure user list

/* --------------------------------------------------
    ROLES AND PERMISSIONS DEFINITION 🔑
-------------------------------------------------- */
const ACCESS_PERMISSIONS = {
    'admin': ['dashboard.html', 'job-entry.html', 'job-queue.html', 'customers.html', 'expenses.html', 'reports.html', 'settings.html'],
    'manager': ['dashboard.html', 'job-entry.html', 'job-queue.html', 'customers.html', 'expenses.html'],
    'viewer': ['dashboard.html', 'job-queue.html', 'customers.html']
};

/* --------------------------------------------------
    INITIAL LOGIN CREDENTIALS 🔒 (Used only for first-time setup)
-------------------------------------------------- */
const INITIAL_CREDENTIALS = [
    { username: "admin", password: "admin123", name: "Admin User", role: "admin" },
    { username: "ganesh", password: "ganesh123", name: "Ganesh Sharma", role: "manager" },
    { username: "pooja", password: "pooja456", name: "Pooja Singh", role: "viewer" }
];

/* --------------------------------------------------
    USER CREDENTIAL MANAGEMENT
-------------------------------------------------- */
function getUserCredentials() {
    let users = JSON.parse(localStorage.getItem(USER_CREDENTIALS_KEY));
    if (!users || users.length === 0) {
        // Initialize if empty, and save it back
        users = INITIAL_CREDENTIALS;
        localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(users));
    }
    return users;
}

function saveUserCredentials(users) {
    localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(users));
}

/* --------------------------------------------------
    MANAGER/USER MANAGEMENT FUNCTIONS
-------------------------------------------------- */
function initManagers() {
    const users = getUserCredentials();
    
    // Managers for the job assignment dropdown should be all users who are NOT just 'viewer'
    let managers = users
        .filter(user => user.role !== 'viewer')
        .map(user => user.name);
            
    // Ensure uniqueness and sort, with 'Admin User' first
    managers = [...new Set(managers)].sort((a, b) => {
        if (a === 'Admin User') return -1;
        return a.localeCompare(b);
    });

    localStorage.setItem(MANAGER_STORAGE_KEY, JSON.stringify(managers));
}

function getManagers() {
    initManagers(); // Always ensure manager list is derived from user list
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
    
    const users = getUserCredentials();
    const validUser = users.find(u => u.username === user && u.password === pass);

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
    ACCESS CONTROL CHECK 🛑
-------------------------------------------------- */
function checkAccess() {
    const userRole = localStorage.getItem("sv_user_role");
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!userRole) return; 

    const allowedPages = ACCESS_PERMISSIONS[userRole] || [];

    if (!allowedPages.includes(currentPage)) {
        console.error(`Access Denied: Role "${userRole}" cannot access ${currentPage}`);
        // Redirect to their default landing page (dashboard)
        window.location.href = `${BASE}/pages/dashboard.html`;
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
    // Set global visibility for ACCESS_PERMISSIONS to be used by all page scripts
    window.ACCESS_PERMISSIONS = ACCESS_PERMISSIONS; 
    
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
// Placeholders for GitHub dispatch functions (requires GITHUB_SITE_KEY defined elsewhere)
async function saveJobToGitHub(newJob) {
    console.warn("GitHub dispatch placeholder called for Job.");
    return true; // Assume success for local testing
}

async function saveExpenseToGitHub(newExpense) {
    console.warn("GitHub dispatch placeholder called for Expense.");
    return true; // Assume success for local testing
}

window.saveJobToGitHub = saveJobToGitHub;
window.saveExpenseToGitHub = saveExpenseToGitHub;


/* --------------------------------------------------
    AUTO INIT
-------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
    
    // Ensure initial users are loaded into storage if not present
    getUserCredentials();

    const form = document.getElementById("loginForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            login();
        });
    }
    
    startLiveClock();
});

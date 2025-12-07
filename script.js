/* script.js - Auth + Header + Clock + Safe GitHub Job/Expense Dispatch + Manager Management */

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
    MANAGER/USER MANAGEMENT FUNCTIONS
    Stores an array of manager names (e.g., ['Admin', 'Ganesh', 'Pooja'])
-------------------------------------------------- */
const MANAGER_STORAGE_KEY = 'sv_managers';

// Function to initialize the manager list if it doesn't exist
function initManagers() {
    let managers = JSON.parse(localStorage.getItem(MANAGER_STORAGE_KEY));
    if (!managers || managers.length === 0) {
        // Default list: 'Admin' and the currently logged-in user's name
        const loggedInUser = localStorage.getItem('username') || validUser.name;
        
        // Use a Set to ensure uniqueness and a robust starting list
        managers = new Set(['Admin', loggedInUser]);
        
        // Convert back to array, ensuring 'Admin' is typically first
        managers = Array.from(managers).sort((a, b) => {
            if (a === 'Admin') return -1;
            if (b === 'Admin') return 1;
            return a.localeCompare(b);
        });

        localStorage.setItem(MANAGER_STORAGE_KEY, JSON.stringify(managers));
    }
}

// Function to retrieve the manager list
function getManagers() {
    initManagers(); // Ensure the list is initialized every time we fetch it
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

    if (user === validUser.username && pass === validUser.password) {
        // Store multiple authentication details
        localStorage.setItem("loggedIn", "yes");
        localStorage.setItem("username", validUser.name);
        localStorage.setItem("sv_user_role", validUser.role); // Store the role
        
        // Ensure managers list is initialized immediately after successful login
        initManagers();
        
        // Use BASE URL for robust redirection
        window.location.href = `${BASE}/pages/dashboard.html`;
    } else {
        errEl.textContent = "Invalid username or password!";
        errEl.style.display = "block";
    }
}

/* --------------------------------------------------
    CHECK LOGIN (for index/login.html to redirect if already logged in)
-------------------------------------------------- */
function checkLogin() {
    if (localStorage.getItem("loggedIn") === "yes") {
        // Use BASE URL for robust redirection
        window.location.href = `${BASE}/pages/dashboard.html`;
    }
}

/* --------------------------------------------------
    CHECK AUTH (for protecting internal pages like dashboard/queue)
-------------------------------------------------- */
function checkAuth() {
    if (localStorage.getItem("loggedIn") !== "yes") {
        // Use BASE URL for robust redirection
        window.location.href = `${BASE}/index.html`; // Redirect to index/login.html
    }
    // Also initialize the header if the page is authenticated
    initHeader();
}

/* --------------------------------------------------
    LOGOUT
-------------------------------------------------- */
function logout() {
    // Clear all authentication-related items
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("sv_user_role");
    
    // Use BASE URL for robust redirection
    window.location.href = `${BASE}/index.html`; // Redirect to index/login.html
}

/* --------------------------------------------------
    SHOW USERNAME IN HEADER
-------------------------------------------------- */
function initHeader() {
    const nameEl = document.getElementById("sv_user_name");
    
    // We rely on 'loggedIn' status which is checked in checkAuth()
    const logged = localStorage.getItem("loggedIn") === "yes";
    const username = localStorage.getItem("username") || "";

    if (nameEl) {
        nameEl.textContent = logged ? username : "";
        // Keep display logic simple by checking the logged status
        nameEl.style.display = logged ? "inline-block" : "none";
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
        el.textContent = now.toLocaleDateString('en-IN') + " " + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
    SAVE EXPENSE (SAFE - REPO DISPATCH)
-------------------------------------------------- */
async function saveExpenseToGitHub(newExpense) {
    // Requires your GITHUB_SITE_KEY to be defined globally (from data/config.js)
    if (typeof GITHUB_SITE_KEY === "undefined" || !GITHUB_SITE_KEY) {
        console.error("❌ ERROR: GITHUB_SITE_KEY missing. Cannot dispatch expense.");
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
            // IMPORTANT: Use a unique event_type
            event_type: "add-expense", 
            client_payload: { expense: newExpense }
        })
    });

    return res.ok;
}

/* --------------------------------------------------
    AUTO INIT
-------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
    
    // Ensure managers are initialized on every page load where script.js runs
    initManagers(); 

    const form = document.getElementById("loginForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            login();
        });
    }
    
    startLiveClock();
});

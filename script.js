/* script.js - AUTHENTICATION, ROLES, ACCESS CONTROL, & USER MANAGEMENT */

/* --------------------------------------------------
    BASE URL FOR REDIRECTION
-------------------------------------------------- */
const BASE = "https://nil4567.github.io/Siddhivinayak_Digital";

/* --------------------------------------------------
    LOCAL STORAGE KEYS
-------------------------------------------------- */
const MANAGER_STORAGE_KEY = 'sv_managers'; 
const USER_CREDENTIALS_KEY = 'sv_user_credentials'; 
const ADMIN_CREDENTIALS_KEY = 'sv_admin_credentials'; 

/* --------------------------------------------------
    ROLES AND PERMISSIONS DEFINITION 🔑 (FINAL STRUCTURE)
-------------------------------------------------- */
const ACCESS_PERMISSIONS = {
    'features': {
        'dashboard': { label: 'Dashboard', page: 'dashboard.html', actions: ['view'] },
        'job_entry': { label: 'New Job Entry', page: 'job-entry.html', actions: ['view', 'manage'] },
        'job_queue': { label: 'Job Queue', page: 'job-queue.html', actions: ['view', 'manage'] },
        'customers': { label: 'Customers', page: 'customers.html', actions: ['view', 'manage'] },
        'expenses': { label: 'Daily Expenses', page: 'expenses.html', actions: ['view', 'manage'] },
        'reports': { label: 'Reports', page: 'reports.html', actions: ['view'] },
        'settings': { label: 'User Settings', page: 'settings.html', actions: ['view', 'manage'] },
        'admin_credentials': { label: 'Admin Credentials', page: 'admin-credentials.html', actions: ['view', 'manage'] } 
    },
    'admin': {
        'dashboard': ['view'], 'job_entry': ['view', 'manage'], 'job_queue': ['view', 'manage'], 
        'customers': ['view', 'manage'], 'expenses': ['view', 'manage'], 'reports': ['view'], 
        'settings': ['view', 'manage'], 'admin_credentials': ['view', 'manage'] 
    },
    'manager': {
        'dashboard': ['view'], 'job_entry': ['view', 'manage'], 'job_queue': ['view', 'manage'], 
        'customers': ['view'], 'expenses': ['view'], 'reports': [], 'settings': [], 'admin_credentials': [] 
    },
    'viewer': {
        'dashboard': ['view'], 'job_entry': ['manage'], 'job_queue': ['view'], 'customers': ['view'], 
        'expenses': [], 'reports': [], 'settings': [], 'admin_credentials': [] 
    }
};
window.ACCESS_PERMISSIONS = ACCESS_PERMISSIONS; 

/* --------------------------------------------------
    INITIAL LOGIN CREDENTIALS 🔒
-------------------------------------------------- */
const INITIAL_CREDENTIALS = [
    { username: "admin", password: "admin123", name: "Admin User", role: "admin", permissions: ACCESS_PERMISSIONS.admin }
];

/* --------------------------------------------------
    USER CREDENTIAL MANAGEMENT
-------------------------------------------------- */
function getUserCredentials() {
    let users = JSON.parse(localStorage.getItem(USER_CREDENTIALS_KEY));
    if (!users || users.length === 0) {
        users = INITIAL_CREDENTIALS;
        localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(users));
    }
    
    return users.map(user => {
        if (!user.permissions) {
            user.permissions = ACCESS_PERMISSIONS[user.role] || ACCESS_PERMISSIONS.viewer; 
        }
        return user;
    });
}

function saveUserCredentials(users) {
    localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(users));
}

/* --------------------------------------------------
    GOOGLE SCRIPT CREDENTIAL MANAGEMENT
-------------------------------------------------- */
function getAdminCredentials() {
    return JSON.parse(localStorage.getItem(ADMIN_CREDENTIALS_KEY)) || { url: '', token: '' };
}

function saveAdminCredentials(url, token) {
    const creds = { url, token };
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(creds));
    return creds;
}
window.getAdminCredentials = getAdminCredentials;
window.saveAdminCredentials = saveAdminCredentials;


/* --------------------------------------------------
    LOGIN & LOGOUT FUNCTIONS
-------------------------------------------------- */
function login() {
    const userEl = document.getElementById("username");
    const passEl = document.getElementById("password");
    const errEl  = document.getElementById("error");

    if (!userEl || !passEl || !errEl) return;

    const user = userEl.value.trim().toLowerCase();
    const pass = passEl.value;
    
    const users = getUserCredentials();
    const validUser = users.find(u => u.username === user && u.password === pass);

    if (validUser) {
        localStorage.setItem("loggedIn", "yes");
        localStorage.setItem("username", validUser.name);
        localStorage.setItem("sv_user_role", validUser.role);
        localStorage.setItem("sv_user_permissions", JSON.stringify(validUser.permissions));
        
        initManagers();
        
        window.location.href = `${BASE}/pages/dashboard.html`;
    } else {
        errEl.textContent = "Invalid username or password! Access Denied.";
        errEl.style.display = "block";
    }
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("sv_user_role");
    localStorage.removeItem("sv_user_permissions"); 
    window.location.href = `${BASE}/index.html`;
}


/* --------------------------------------------------
    ACCESS CONTROL CHECK 🛑 (Added null checks for robustness)
-------------------------------------------------- */
function checkAccess() {
    const userPermissions = JSON.parse(localStorage.getItem("sv_user_permissions") || "{}");
    const currentPage = window.location.pathname.split('/').pop();
    const userRole = localStorage.getItem("sv_user_role");
    
    if (userRole === 'admin') return; 

    const currentFeatureKey = Object.keys(ACCESS_PERMISSIONS.features).find(key => 
        ACCESS_PERMISSIONS.features[key].page === currentPage
    );
    
    const hasViewPermission = userPermissions[currentFeatureKey] && userPermissions[currentFeatureKey].includes('view');

    if (currentFeatureKey && !hasViewPermission) {
        console.error(`Access Denied: User (${userRole}) lacks 'view' permission for ${currentFeatureKey}`);
        
        if (currentPage !== 'dashboard.html') {
             alert("Access Denied: You do not have permission to view this page.");
             window.location.href = `${BASE}/pages/dashboard.html`;
        }
    }
}

function checkAuth() {
    if (localStorage.getItem("loggedIn") !== "yes") {
        window.location.href = `${BASE}/index.html`;
    }
    
    // 1. Run Access Check
    checkAccess();
    
    // 2. Initialize Header (added null checks)
    initHeader(); 

    // 3. Initialize Sidebar Hiding
    initSidebarVisibility();
}

/**
 * Hides sidebar links the user does not have permission to view.
 */
function initSidebarVisibility() {
    const userPermissions = JSON.parse(localStorage.getItem("sv_user_permissions") || "{}");
    const features = ACCESS_PERMISSIONS.features;

    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        const href = link.getAttribute('href');
        const pageName = href ? href.split('/').pop() : '';

        const featureKey = Object.keys(features).find(key => 
            features[key].page === pageName
        );

        // Crucial null check: If the feature key is found, then check permissions
        if (featureKey) {
            const hasViewPermission = userPermissions[featureKey] && userPermissions[featureKey].includes('view');

            if (!hasViewPermission) {
                link.style.display = 'none';
            }
        }
    });
}


/* --------------------------------------------------
    HEADER & MANAGER UTILITIES (Added null checks)
-------------------------------------------------- */
function initManagers() {
    const users = getUserCredentials(); 
    let managers = users
        .filter(user => user.role === 'admin' || user.role === 'manager' || user.role === 'custom')
        .map(user => user.name);
            
    managers = [...new Set(managers)].sort((a, b) => {
        if (a === 'Admin User') return -1;
        return a.localeCompare(b);
    });

    localStorage.setItem(MANAGER_STORAGE_KEY, JSON.stringify(managers));
}

function getManagers() {
    initManagers();
    return JSON.parse(localStorage.getItem(MANAGER_STORAGE_KEY));
}

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
    DATA READING FUNCTIONS
-------------------------------------------------- */
const DATA_HOST_BASE = "https://raw.githubusercontent.com/nil4567/Siddhivinayak_Digital/main/data";
const DATA_JOB_FILE = 'jobs.json';
const DATA_EXPENSE_FILE = 'expenses.json';

async function fetchData(filename) {
    try {
        const url = `${DATA_HOST_BASE}/${filename}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Error fetching ${filename}: ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to parse JSON for ${filename}:`, error);
        return [];
    }
}

async function getAllJobs() {
    return fetchData(DATA_JOB_FILE);
}

async function getAllExpenses() {
    return fetchData(DATA_EXPENSE_FILE);
}

window.getAllJobs = getAllJobs;
window.getAllExpenses = getAllExpenses;


/* --------------------------------------------------
    DATA WRITING FUNCTIONS (Google Script)
-------------------------------------------------- */
async function sendDataToScript(type, data) {
    const creds = getAdminCredentials();
    const scriptUrl = creds.url;
    const token = creds.token;

    if (!scriptUrl || !token) {
        alert("CRITICAL ERROR: Google Apps Script URL or Token is not configured. Please contact the Admin.");
        // Only redirect if we are NOT on the credentials page, to avoid loop
        if (window.location.pathname.indexOf('admin-credentials.html') === -1) {
            window.location.href = `${BASE}/pages/admin-credentials.html`;
        }
        return false;
    }

    try {
        const response = await fetch(scriptUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'X-App-Security-Token': token 
            },
            body: JSON.stringify({ type, data })
        });

        if (!response.ok) {
            throw new Error(`Script returned status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === 'success') {
            return true;
        } else {
            alert(`Error from Script: ${result.message || "Unknown error."}`);
            return false;
        }

    } catch (error) {
        console.error("Error communicating with Google Script:", error);
        alert(`Failed to save data: Check script URL or network connection. Error: ${error.message}`);
        return false;
    }
}

async function saveJobToScript(newJob) { return sendDataToScript('new_job', newJob); }
async function saveExpenseToScript(newExpense) { return sendDataToScript('new_expense', newExpense); }

window.saveJobToScript = saveJobToScript;
window.saveExpenseToScript = saveExpenseToScript;


/* --------------------------------------------------
    AUTO INIT (CRITICAL FIXES HERE)
-------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
    // These functions ensure data is prepared, they are safe to run early.
    getUserCredentials(); 
    initManagers(); 

    // Find the login form if it exists (only on login.html)
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            login();
        });
    }
    
    // Only run checkAuth on internal pages, which will call initHeader and initSidebarVisibility
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'index.html' && currentPage !== 'login.html') {
        // This is the gatekeeper for all internal pages
        checkAuth(); 
    } else {
        // Run header and clock even if not authenticated (e.g., on index page)
        initHeader();
    }
    
    startLiveClock();
});

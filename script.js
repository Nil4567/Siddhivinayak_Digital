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
    ROLES AND PERMISSIONS DEFINITION 🔑 (NEW STRUCTURE)
    Defines allowed actions (view, manage, delete) for different features/pages.
-------------------------------------------------- */
const ACCESS_PERMISSIONS = {
    // Defines the full set of features and the pages/links they map to
    'features': {
        'dashboard': { label: 'Dashboard', page: 'dashboard.html', actions: ['view'] },
        'job_entry': { label: 'New Job Entry', page: 'job-entry.html', actions: ['view', 'manage'] },
        'job_queue': { label: 'Job Queue', page: 'job-queue.html', actions: ['view', 'manage'] },
        'customers': { label: 'Customers', page: 'customers.html', actions: ['view', 'manage'] },
        'expenses': { label: 'Daily Expenses', page: 'expenses.html', actions: ['view', 'manage'] },
        'reports': { label: 'Reports', page: 'reports.html', actions: ['view'] },
        'settings': { label: 'Settings', page: 'settings.html', actions: ['view', 'manage'] }
    },

    // Defines which actions each standard role is allowed to perform
    'admin': {
        'dashboard': ['view'],
        'job_entry': ['view', 'manage'],
        'job_queue': ['view', 'manage'],
        'customers': ['view', 'manage'],
        'expenses': ['view', 'manage'],
        'reports': ['view'],
        'settings': ['view', 'manage']
    },
    'manager': {
        'dashboard': ['view'],
        'job_entry': ['view', 'manage'],
        'job_queue': ['view', 'manage'],
        'customers': ['view', 'manage'],
        'expenses': ['view', 'manage'],
        'reports': [], // No access
        'settings': [] // No access
    },
    'viewer': {
        'dashboard': ['view'],
        'job_entry': [], // No access
        'job_queue': ['view'],
        'customers': ['view'],
        'expenses': [], // No access
        'reports': [], // No access
        'settings': [] // No access
    }
};

/* --------------------------------------------------
    INITIAL LOGIN CREDENTIALS 🔒
    NOTE: Added a 'permissions' object to initial users to handle the new structure
-------------------------------------------------- */
const INITIAL_CREDENTIALS = [
    { username: "admin", password: "admin123", name: "Admin User", role: "admin", permissions: ACCESS_PERMISSIONS.admin },
    { username: "ganesh", password: "ganesh123", name: "Ganesh Sharma", role: "manager", permissions: ACCESS_PERMISSIONS.manager },
    { username: "pooja", password: "pooja456", name: "Pooja Singh", role: "viewer", permissions: ACCESS_PERMISSIONS.viewer }
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
    // Ensure older user objects have the 'permissions' field, using role defaults if missing
    return users.map(user => {
        if (!user.permissions) {
            // Assign default permissions based on their role if the field is missing
            user.permissions = ACCESS_PERMISSIONS[user.role] || ACCESS_PERMISSIONS.viewer; 
        }
        return user;
    });
}

function saveUserCredentials(users) {
    localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(users));
}

/* --------------------------------------------------
    MANAGER/USER MANAGEMENT FUNCTIONS
-------------------------------------------------- */
function initManagers() {
    // This function must only use the name field to populate the managers list
    const users = getUserCredentials(); 
    let managers = users
        .filter(user => user.role === 'admin' || user.role === 'manager' || user.role === 'custom') // Include custom roles for assignment
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
        // Store user details, including their specific permissions object
        localStorage.setItem("loggedIn", "yes");
        localStorage.setItem("username", validUser.name);
        localStorage.setItem("sv_user_role", validUser.role);
        localStorage.setItem("sv_user_permissions", JSON.stringify(validUser.permissions)); // NEW: Store permissions object
        
        initManagers();
        
        // Redirect to the dashboard
        window.location.href = `${BASE}/pages/dashboard.html`;
    } else {
        errEl.textContent = "Invalid username or password!";
        errEl.style.display = "block";
    }
}

/* --------------------------------------------------
    ACCESS CONTROL CHECK 🛑 (Updated to use NEW permissions)
-------------------------------------------------- */
function checkAccess() {
    const userPermissions = JSON.parse(localStorage.getItem("sv_user_permissions") || "{}");
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!userPermissions) return; 

    // Find the feature associated with the current page
    const currentFeatureKey = Object.keys(ACCESS_PERMISSIONS.features).find(key => 
        ACCESS_PERMISSIONS.features[key].page === currentPage
    );
    
    // Check if the user has *any* permission (e.g., 'view') for this feature
    const hasAnyPermission = userPermissions[currentFeatureKey] && userPermissions[currentFeatureKey].length > 0;

    if (!hasAnyPermission) {
        console.error(`Access Denied: Cannot access page ${currentPage}`);
        // Log out or redirect to a safe page if access is denied
        if (currentPage !== 'dashboard.html') {
             window.location.href = `${BASE}/pages/dashboard.html`;
        } else {
             console.warn("User is on dashboard but has no dashboard permission.");
        }
    }
}


/* --------------------------------------------------
    AUTH FUNCTIONS (Minor Update)
-------------------------------------------------- */
function checkAuth() {
    if (localStorage.getItem("loggedIn") !== "yes") {
        window.location.href = `${BASE}/index.html`;
    }
    window.ACCESS_PERMISSIONS = ACCESS_PERMISSIONS; 
    
    checkAccess();
    initHeader();
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("sv_user_role");
    localStorage.removeItem("sv_user_permissions"); // NEW: Clear permissions on logout
    window.location.href = `${BASE}/index.html`;
}


/* --------------------------------------------------
    HEADER & CLOCK, SAVE JOB/EXPENSE (Unchanged)
-------------------------------------------------- */
function checkLogin() {
    if (localStorage.getItem("loggedIn") === "yes") {
        window.location.href = `${BASE}/pages/dashboard.html`;
    }
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

async function saveJobToGitHub(newJob) {
    console.warn("GitHub dispatch placeholder called for Job.");
    return true; 
}

async function saveExpenseToGitHub(newExpense) {
    console.warn("GitHub dispatch placeholder called for Expense.");
    return true; 
}

window.saveJobToGitHub = saveJobToGitHub;
window.saveExpenseToGitHub = saveExpenseToGitHub;


/* --------------------------------------------------
    AUTO INIT
-------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
    // This call ensures local storage is populated with default users/permissions 
    // immediately if it's the very first time running the app.
    getUserCredentials(); 
    initManagers(); // Ensure managers list is set up early.

    const form = document.getElementById("loginForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            login();
        });
    }
    
    startLiveClock();
});

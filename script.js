// Global Constants
const ADMIN_CREDENTIALS_KEY = 'sv_admin_credentials'; // Key for Google Script URL & Token
const MANAGER_LIST_KEY = 'sv_manager_list'; // Key for the list of managers/users
const APP_DATA_TYPE_JOB = 'JOB_ENTRY';
const APP_DATA_TYPE_EXPENSE = 'DAILY_EXPENSE';

/* --------------------------------------------------
    1. AUTHENTICATION AND UTILITY FUNCTIONS
-------------------------------------------------- */

/**
 * Checks if the user is authenticated and redirects if not.
 */
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('sv_user_role');

    if (!isLoggedIn) {
        // Not logged in, redirect to login page
        if (window.location.pathname.indexOf('index.html') === -1) {
            window.location.href = '../index.html';
        }
    } else {
        // Logged in, update UI elements
        const userNameDisplay = document.getElementById('sv_user_name');
        if (userNameDisplay) {
            userNameDisplay.textContent = username + ' (' + userRole.charAt(0).toUpperCase() + userRole.slice(1) + ')';
        }
        updateLiveTime();
        setInterval(updateLiveTime, 1000); // Start the clock
    }
}

/**
 * Updates the live time display (simple utility).
 */
function updateLiveTime() {
    const timeElement = document.getElementById('liveTime');
    if (timeElement) {
        timeElement.textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    }
}

/**
 * Logs the user out and clears session data.
 */
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('sv_user_role');
    // Keep credentials and manager list saved for next login/admin
    window.location.href = '../index.html';
}

window.checkAuth = checkAuth;
window.logout = logout;

/* --------------------------------------------------
    2. CREDENTIAL MANAGEMENT (For Admin Page)
-------------------------------------------------- */

/**
 * Retrieves the saved Google Apps Script URL and Token.
 * @returns {object} {url: string, token: string}
 */
function getAdminCredentials() {
    const creds = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    return creds ? JSON.parse(creds) : { url: '', token: '' };
}

/**
 * Saves the Google Apps Script URL and Token to Local Storage.
 * (Used by admin-credentials.html)
 * @param {string} url - The deployed Apps Script URL.
 * @param {string} token - The custom security token.
 */
function saveAdminCredentials(url, token) {
    const creds = { url, token };
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(creds));
    return creds;
}

window.getAdminCredentials = getAdminCredentials;
window.saveAdminCredentials = saveAdminCredentials;

/* --------------------------------------------------
    3. USER / MANAGER LIST MANAGEMENT
-------------------------------------------------- */

/**
 * Retrieves the list of managers (users) from Local Storage.
 * (Used by job-entry.html and expenses.html)
 * NOTE: This assumes the manager list is saved elsewhere, e.g., in settings.html
 * For now, it returns a placeholder list or the last saved list.
 * @returns {Array<string>} List of manager names.
 */
function getManagers() {
    // We assume the user management page saves a list of manager names
    const rawUsers = localStorage.getItem(MANAGER_LIST_KEY);
    if (rawUsers) {
        try {
            return JSON.parse(rawUsers);
        } catch (e) {
            console.error("Error parsing manager list:", e);
            return ['Admin User', 'Manager 1', 'User 1']; // Fallback
        }
    }
    // Default fallback list
    return ['Admin User', 'Manager 1', 'User 1'];
}

window.getManagers = getManagers;

/* --------------------------------------------------
    4. DATA SUBMISSION LOGIC (CORE FUNCTIONALITY)
-------------------------------------------------- */

/**
 * Core function to send data to the Google Apps Script.
 * @param {object} data - The data payload (job or expense data).
 * @param {string} dataType - Either APP_DATA_TYPE_JOB or APP_DATA_TYPE_EXPENSE.
 * @returns {Promise<boolean>} True if successful, False otherwise.
 */
async function sendDataToScript(data, dataType) {
    const { url, token } = getAdminCredentials();

    // CRITICAL CHECK: This is why the Job Entry page was redirecting!
    if (!url || !token) {
        alert("CRITICAL ERROR: Google Apps Script URL or Token is not configured. Please contact Admin.");
        window.location.href = '../pages/admin-credentials.html';
        return false;
    }

    const payload = {
        appToken: token, // The security token
        dataType: dataType, // 'JOB_ENTRY' or 'DAILY_EXPENSE'
        data: data
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors', // Required for Google Apps Script web apps
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // The Apps Script usually returns a JSON response like {result: 'success'}
        const result = await response.json();

        if (result.result === 'success') {
            return true;
        } else {
            alert(`Server Error: Data submission failed.\nReason: ${result.error || 'Check Google Apps Script logs.'}`);
            return false;
        }
    } catch (error) {
        console.error("Fetch API error:", error);
        alert("Network Error: Could not connect to the Google Apps Script URL. Check URL and internet connection.");
        return false;
    }
}

/**
 * Specific function to save Job data (Used by job-entry.html).
 * @param {object} jobData - The job details.
 * @returns {Promise<boolean>}
 */
async function saveJobToScript(jobData) {
    return sendDataToScript(jobData, APP_DATA_TYPE_JOB);
}

/**
 * Specific function to save Expense data (Will be used by expenses.html).
 * @param {object} expenseData - The expense details.
 * @returns {Promise<boolean>}
 */
async function saveExpenseToScript(expenseData) {
    return sendDataToScript(expenseData, APP_DATA_TYPE_EXPENSE);
}

window.saveJobToScript = saveJobToScript;
window.saveExpenseToScript = saveExpenseToScript;

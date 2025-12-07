// Global Constants
const ADMIN_CREDENTIALS_KEY = 'sv_admin_credentials'; 
const MANAGER_LIST_KEY = 'sv_manager_list';
const APP_DATA_TYPE_JOB = 'JOB_ENTRY';
const APP_DATA_TYPE_EXPENSE = 'DAILY_EXPENSE';

/* --------------------------------------------------
    *** HARDCODED CREDENTIALS (NO LOCAL STORAGE) ***
    
    CRITICAL: REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL VALUES
-------------------------------------------------- */
const HARDCODED_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec"; 
const HARDCODED_SECURITY_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987"; 

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
        if (window.location.pathname.indexOf('index.html') === -1) {
            window.location.href = '../index.html';
        }
    } else {
        const userNameDisplay = document.getElementById('sv_user_name');
        if (userNameDisplay) {
            userNameDisplay.textContent = username + ' (' + userRole.charAt(0).toUpperCase() + userRole.slice(1) + ')';
        }
        updateLiveTime();
        setInterval(updateLiveTime, 1000);
    }
}

function updateLiveTime() {
    const timeElement = document.getElementById('liveTime');
    if (timeElement) {
        timeElement.textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('sv_user_role');
    window.location.href = '../index.html';
}

window.checkAuth = checkAuth;
window.logout = logout;

/* --------------------------------------------------
    2. CREDENTIAL MANAGEMENT (NOW HARDCODED)
-------------------------------------------------- */

/**
 * Retrieves the hardcoded Google Apps Script URL and Token.
 * @returns {object} {url: string, token: string}
 */
function getAdminCredentials() {
    return { 
        url: HARDCODED_SCRIPT_URL, 
        token: HARDCODED_SECURITY_TOKEN 
    };
}

// NOTE: saveAdminCredentials is no longer needed/used since data is hardcoded.

window.getAdminCredentials = getAdminCredentials;


/* --------------------------------------------------
    3. USER / MANAGER LIST MANAGEMENT
-------------------------------------------------- */

/**
 * Retrieves the list of managers (users) from Local Storage.
 * @returns {Array<string>} List of manager names.
 */
function getManagers() {
    const rawUsers = localStorage.getItem(MANAGER_LIST_KEY);
    if (rawUsers) {
        try {
            return JSON.parse(rawUsers);
        } catch (e) {
            console.error("Error parsing manager list:", e);
            return ['Admin User', 'Manager 1', 'User 1'];
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

    // CRITICAL CHECK: Now checks if hardcoded values are still the placeholder text
    if (url.includes('YOUR_DEPLOYED') || token.includes('YOUR_UNIQUE')) {
        alert("CRITICAL ERROR: Hardcoded Google Apps Script URL or Token is not configured. Please update script.js with your credentials.");
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
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

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

window.saveJobToScript = saveJobToScript;

/* --------------------------------------------------
   *** HARDCODED CREDENTIALS (NO LOCAL STORAGE) ***
   
   CRITICAL: REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL VALUES
-------------------------------------------------- */
const HARDCODED_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec"; 
const HARDCODED_SECURITY_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987"; 

// --------------------------------------------------
// --- CORE DATA SUBMISSION (POST) ---
// --------------------------------------------------

/**
 * Core function to FETCH data (using POST request) to the Google Apps Script.
 * @param {object} dataObject - The payload to send (e.g., jobData or expenseData).
 * @param {string} dataType - Identifier for the script ('JOB_ENTRY', 'DAILY_EXPENSE', etc.).
 * @returns {Promise<boolean>} True if submission was successful.
 */
async function sendDataToScript(dataObject, dataType) {
    const url = HARDCODED_SCRIPT_URL;
    const token = HARDCODED_SECURITY_TOKEN;

    if (url.includes('YOUR_DEPLOYED') || token.includes('YOUR_UNIQUE')) {
        alert("CRITICAL ERROR: Google Apps Script URL or Token is not configured in script.js!");
        return false;
    }
    
    const payload = {
        appToken: token,
        dataType: dataType,
        data: dataObject
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
            console.error("Server Error:", result.error);
            alert(`Submission failed! Server responded with: ${result.error}`);
            return false;
        }

    } catch (error) {
        console.error("Fetch API (POST) error:", error);
        alert("Could not connect to the Google Apps Script URL. Check your URL and internet connection.");
        return false;
    }
}

/**
 * Core function to send Settings (Users/Managers) data to the Google Apps Script.
 * This is a specialized POST request using the USER_SETTINGS identifier.
 * @param {object} settingsData - The payload containing managers and users array.
 * @returns {Promise<boolean>} True if submission was successful.
 */
async function saveUserSettingsToSheet(settingsData) {
    // Re-use the existing sendDataToScript logic but with the correct type
    return sendDataToScript(settingsData, 'USER_SETTINGS');
}

// --------------------------------------------------
// --- CORE DATA RETRIEVAL (GET) ---
// --------------------------------------------------

/**
 * Core function to RETRIEVE data (GET request) from the Google Apps Script.
 * This is crucial for fetching user lists, customer lists, job queue, etc.
 * @param {string} dataType - Identifier for the script ('USER_CREDENTIALS', 'JOB_QUEUE', 'CUSTOMER_LIST').
 * @returns {Promise<Array | null>} Array of data rows, or null on failure.
 */
async function fetchSheetData(dataType) {
    const url = HARDCODED_SCRIPT_URL;
    const token = HARDCODED_SECURITY_TOKEN;

    if (url.includes('YOUR_DEPLOYED') || token.includes('YOUR_UNIQUE')) {
        alert("CRITICAL ERROR: Google Apps Script URL or Token is not configured in script.js!");
        return null;
    }

    // Construct the GET URL with parameters
    const fetchUrl = `${url}?appToken=${token}&dataType=${dataType}`;
    
    try {
        const response = await fetch(fetchUrl, {
            method: 'GET',
            mode: 'cors'
        });

        const result = await response.json();

        if (result.result === 'success' && Array.isArray(result.data)) {
            return result.data; // Returns the array of sheet data
        } else {
            console.error(`Server Error fetching ${dataType}:`, result.error || 'Unknown error');
            return null;
        }

    } catch (error) {
        console.error("Fetch API (GET) error:", error);
        return null;
    }
}


// --------------------------------------------------
// --- AUTHENTICATION & SESSION MANAGEMENT ---
// --------------------------------------------------

/**
 * Checks if a user is logged in (session token exists).
 * Required by settings.html to prevent unauthorized access.
 */
function checkAuth() {
    const userToken = localStorage.getItem('sv_user_token');
    const userName = localStorage.getItem('sv_user_name');
    
    if (!userToken || !userName) {
        // Redirects user to the login page
        window.location.href = '../index.html'; 
    } else {
        // Update user display element
        const userNameElement = document.getElementById('sv_user_name');
        if (userNameElement) {
            userNameElement.textContent = userName;
        }
    }
}

/**
 * Clears the session and redirects to the login page.
 */
function logout() {
    localStorage.removeItem('sv_user_token');
    localStorage.removeItem('sv_user_name');
    window.location.href = '../index.html';
}

// --------------------------------------------------
// --- GLOBAL EXPORTS (THE FIX) ---
// --------------------------------------------------

// CRITICAL: Attaches all necessary functions to the global window object.
window.sendDataToScript = sendDataToScript;
window.saveUserSettingsToSheet = saveUserSettingsToSheet;
window.fetchSheetData = fetchSheetData; // FIX for fetchSheetData is not a function
window.checkAuth = checkAuth;           // FIX for checkAuth is not a function
window.logout = logout;

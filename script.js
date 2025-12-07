/* --------------------------------------------------
   *** CONFIGURATION & HARDCODED CREDENTIALS ***
   
   CRITICAL: Ensure these values match Code.gs and your deployment.
-------------------------------------------------- */
const HARDCODED_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec"; 
const HARDCODED_SECURITY_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987"; 

// --- Fallback Admin Credentials (New Addition for initial access) ---
// Used only if the application cannot fetch the user list OR if the fetched list is empty.
const FALLBACK_USERNAME = 'admin';
const FALLBACK_PASSWORD = 'admin123';
// -------------------------------------------------------------------

// --------------------------------------------------
// --- CORE DATA SUBMISSION (POST) ---
// --------------------------------------------------

/**
 * Core function to send data to the Google Apps Script (POST).
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
            headers: { 'Content-Type': 'application/json' },
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
 * Specialized POST request for saving user settings.
 */
async function saveUserSettingsToSheet(settingsData) {
    return sendDataToScript(settingsData, 'USER_SETTINGS');
}

// --------------------------------------------------
// --- CORE DATA RETRIEVAL (GET) ---
// --------------------------------------------------

/**
 * Core function to RETRIEVE data (GET request) from the Google Apps Script.
 */
async function fetchSheetData(dataType) {
    const url = HARDCODED_SCRIPT_URL;
    const token = HARDCODED_SECURITY_TOKEN;

    if (url.includes('YOUR_DEPLOYED') || token.includes('YOUR_UNIQUE')) {
        alert("CRITICAL ERROR: Google Apps Script URL or Token is not configured in script.js!");
        return null;
    }

    const fetchUrl = `${url}?appToken=${token}&dataType=${dataType}`;
    
    try {
        const response = await fetch(fetchUrl, { method: 'GET', mode: 'cors' });
        const result = await response.json();

        if (result.result === 'success' && Array.isArray(result.data)) {
            return result.data; 
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
 * Helper function to store session data.
 */
function completeLogin(username, isManager) {
    // Generate a simple token (e.g., base64 encoding username + timestamp)
    const token = btoa(`${username}:${Date.now()}`); 
    localStorage.setItem('sv_user_token', token);
    localStorage.setItem('sv_user_name', username);
    localStorage.setItem('sv_is_manager', isManager ? 'true' : 'false');
    window.location.href = './dashboard.html';
}

/**
 * The core login logic with the new Fallback Admin check.
 */
async function handleLogin(username, password) {
    // 1. Attempt to fetch credentials from the Google Sheet
    const usersList = await fetchSheetData('USER_CREDENTIALS');
    
    // Check if the input matches the Fallback Admin credentials first
    if (username === FALLBACK_USERNAME && password === FALLBACK_PASSWORD) {
         // This check runs regardless of the sheet state
         console.warn("Using fallback admin credentials.");
         completeLogin(username, true); 
         return; // Exit successfully
    }

    // 2. If it's NOT the fallback admin, we MUST rely on the sheet data.
    if (usersList && usersList.length > 0) {
        const match = usersList.find(row => row[0] === username && row[1] === password);
        
        if (match) {
            // Success: Found user in the Sheet
            const isManager = match[2] === 'Yes'; 
            completeLogin(username, isManager);
            return; // Exit successfully
        }
    }
    
    // Login Failed
    throw new Error("Invalid username or password.");
}

/**
 * Checks if a user is logged in.
 */
function checkAuth() {
    const userToken = localStorage.getItem('sv_user_token');
    const userName = localStorage.getItem('sv_user_name');
    
    if (!userToken || !userName) {
        window.location.href = '../index.html'; 
    } else {
        const userNameElement = document.getElementById('sv_user_name');
        if (userNameElement) {
            userNameElement.textContent = userName;
        }
    }
}

/**
 * Clears the session.
 */
function logout() {
    localStorage.clear(); // Clear all keys
    window.location.href = '../index.html';
}

// --------------------------------------------------
// --- GLOBAL EXPORTS (CRITICAL FIX FOR TYPEERRORS) ---
// --------------------------------------------------

window.sendDataToScript = sendDataToScript;
window.saveUserSettingsToSheet = saveUserSettingsToSheet;
window.fetchSheetData = fetchSheetData; 
window.checkAuth = checkAuth;           
window.logout = logout;
window.handleLogin = handleLogin;

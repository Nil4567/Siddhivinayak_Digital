/* --------------------------------------------------
   *** CONFIGURATION & HARDCODED CREDENTIALS ***
   
   CRITICAL: Ensure these values match Code.gs and your deployment.
-------------------------------------------------- */
const HARDCODED_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec"; 
const HARDCODED_SECURITY_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987"; 

// --- SUPER ADMIN CREDENTIALS (NEW CONCEPT) ---
// This is a permanent, hardcoded bypass for emergency access and setup.
const SUPER_ADMIN_USERNAME = 'superadmin';
const SUPER_ADMIN_PASSWORD = 'superadminpass';
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
        // Return null on catastrophic failure (e.g., network error)
        return null;
    }
}

// --------------------------------------------------
// --- AUTHENTICATION & SESSION MANAGEMENT ---
// --------------------------------------------------

/**
 * Helper function to store session data.
 * The isSuperAdmin flag is new and important for bypassing restrictions later.
 */
function completeLogin(username, isManager, isSuperAdmin = false) {
    // Generate a simple token 
    const token = btoa(`${username}:${Date.now()}`); 
    localStorage.setItem('sv_user_token', token);
    localStorage.setItem('sv_user_name', username);
    localStorage.setItem('sv_is_manager', isManager ? 'true' : 'false');
    // Store the Super Admin status
    localStorage.setItem('sv_is_superadmin', isSuperAdmin ? 'true' : 'false'); 
    window.location.href = './dashboard.html';
}

/**
 * The core login logic with the new Super Admin check as the highest priority.
 */
async function handleLogin(username, password) {
    // 1. SUPER ADMIN BYPASS CHECK (Highest Priority)
    if (username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
         console.warn("Super Admin bypass engaged.");
         // Super Admin is always a Manager
         completeLogin(username, true, true); 
         return; // Exit successfully
    }
    
    // 2. STANDARD CHECK: Attempt to fetch credentials from the Google Sheet
    const usersList = await fetchSheetData('USER_CREDENTIALS');
    
    if (usersList && usersList.length > 0) {
        // If data was fetched and is NOT empty, use the Sheet data
        const match = usersList.find(row => row[0] === username && row[1] === password);
        
        if (match) {
            // Success: Found user in the Sheet
            const isManager = match[2] === 'Yes'; 
            completeLogin(username, isManager, false);
            return; // Exit successfully
        }
    }

    // 3. LOGIN FAILED (Either credentials don't match or sheet access failed)
    throw new Error("Invalid username or password.");
}

/**
 * Clears the session.
 */
function logout() {
    localStorage.clear(); // Clear all keys
    window.location.href = '../index.html';
}

// --------------------------------------------------
// --- AUTHENTICATION & AUTHORIZATION ---
// --------------------------------------------------

/**
 * Checks if a user is logged in and authorized to view the page.
 * This is the ONLY DEFINITION.
 */
function checkAuth() {
    const userToken = localStorage.getItem('sv_user_token');
    const userName = localStorage.getItem('sv_user_name');
    // CRITICAL: This retrieves the flag set during successful login.
    const isSuperAdmin = localStorage.getItem('sv_is_superadmin') === 'true'; 
    
    // Check 1: If no token or name, redirect to login (Standard failure)
    if (!userToken || !userName) {
        // The path needs to be absolute or reliably relative to the root index.html
        window.location.href = '/Siddhivinayak_Digital/index.html'; 
        return; 
    } 
    
    // Check 2: Update the display name (Always runs if logged in)
    const userNameElement = document.getElementById('sv_user_name');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }

    // If the user reaches this point, they are logged in and authorized for a standard page.
    // Further page-specific checks (e.g., locking down the "User Management" link) can happen in the HTML script block.
    console.log(`User logged in: ${userName}. Super Admin: ${isSuperAdmin}`);
}


// --------------------------------------------------
// --- GLOBAL EXPORTS ---
// --------------------------------------------------

window.sendDataToScript = sendDataToScript;
window.saveUserSettingsToSheet = saveUserSettingsToSheet;
window.fetchSheetData = fetchSheetData; 
window.checkAuth = checkAuth;           
window.logout = logout;
window.handleLogin = handleLogin;

 /* --------------------------------------------------
    *** HARDCODED CREDENTIALS (NO LOCAL STORAGE) ***
    
    CRITICAL: REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL VALUES
-------------------------------------------------- */
const HARDCODED_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec"; 
const HARDCODED_SECURITY_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987"; 

 // --- REMOVE THE OLD GETTER FUNCTION ---
// The old function that fetched from Local Storage is now obsolete.
// Remove getAdminCredentials and use the constants above directly.

/**
 * Core function to FETCH data (using POST request) to the Google Apps Script.
 * Now uses hardcoded constants for URL and Token.
 * @param {object} dataObject - The payload to send (e.g., jobData or expenseData).
 * @param {string} dataType - Identifier for the script ('JOB_ENTRY' or 'DAILY_EXPENSE').
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
     /**
 * Core function to send Settings (Users/Managers) data to the Google Apps Script.
 * @param {object} settingsData - The payload containing managers and users array.
 * @returns {Promise<boolean>} True if submission was successful.
 */
async function saveUserSettingsToSheet(settingsData) {
    // Re-use the existing sendDataToScript logic but adapt the payload
    
    const url = HARDCODED_SCRIPT_URL;
    const token = HARDCODED_SECURITY_TOKEN;

    if (url.includes('YOUR_DEPLOYED') || token.includes('YOUR_UNIQUE')) {
        alert("CRITICAL ERROR: Google Apps Script URL or Token is not configured in script.js.");
        return false;
    }
    
    const payload = {
        appToken: token,
        dataType: 'USER_SETTINGS', // New data type identifier
        data: settingsData
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
            alert(`Settings Submission failed! Server responded with: ${result.error}`);
            return false;
        }

    } catch (error) {
        console.error("Fetch API (POST) error for settings:", error);
        alert("Could not connect to the Google Apps Script URL for settings submission.");
        return false;
    }
}
window.saveUserSettingsToSheet = saveUserSettingsToSheet; // Export globally
    }
}
window.sendDataToScript = sendDataToScript; // Ensure this is still exported

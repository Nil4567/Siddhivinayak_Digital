/* --------------------------------------------------
   *** CONFIGURATION & HARDCODED CREDENTIALS ***
-------------------------------------------------- */
const HARDCODED_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec"; 
const HARDCODED_SECURITY_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987";



/* --------------------------------------------------
   *** SUPER ADMIN (Hashed Password Version) ***
-------------------------------------------------- */

const SUPER_ADMIN_USERNAME = "superadmin";

// SHA-256 hash of "admin@123"
const SUPER_ADMIN_HASH = "6e0d5e0ef25c60d1db6cf2ce0dfafad9dca7ee33dcb162d432c50b0f3954e7d6";

// Hash function (required for checking password)
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}



/* --------------------------------------------------
   *** CORE DATA SUBMISSION (POST) ***
-------------------------------------------------- */

async function sendDataToScript(dataObject, dataType) {
    const url = HARDCODED_SCRIPT_URL;
    const token = HARDCODED_SECURITY_TOKEN;

    if (url.includes("YOUR_DEPLOYED") || token.includes("YOUR_UNIQUE")) {
        alert("CRITICAL ERROR: Google Script URL or Token missing in script.js!");
        return false;
    }

    const payload = {
        appToken: token,
        dataType: dataType,
        data: dataObject
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.result === "success") {
            return true;
        } else {
            console.error("Server Error:", result.error);
            alert(`Submission failed: ${result.error}`);
            return false;
        }
    } catch (error) {
        console.error("Fetch API POST error:", error);
        alert("Unable to connect to Google Apps Script. Check URL & Internet.");
        return false;
    }
}

async function saveUserSettingsToSheet(settingsData) {
    return sendDataToScript(settingsData, "USER_SETTINGS");
}



/* --------------------------------------------------
   *** CORE DATA RETRIEVAL (GET) ***
-------------------------------------------------- */

async function fetchSheetData(dataType) {
    const url = HARDCODED_SCRIPT_URL;
    const token = HARDCODED_SECURITY_TOKEN;

    if (url.includes("YOUR_DEPLOYED") || token.includes("YOUR_UNIQUE")) {
        alert("CRITICAL ERROR: Script URL or Token missing in script.js!");
        return null;
    }

    const fetchUrl = `${url}?appToken=${token}&dataType=${dataType}`;

    try {
        const response = await fetch(fetchUrl, { method: "GET", mode: "cors" });
        const result = await response.json();

        if (result.result === "success" && Array.isArray(result.data)) {
            return result.data;
        } else {
            console.error("Fetch Error:", result.error);
            return null;
        }
    } catch (error) {
        console.error("Fetch API GET error:", error);
        return null;
    }
}



/* --------------------------------------------------
   *** AUTHENTICATION & SESSION MANAGEMENT ***
-------------------------------------------------- */

function completeLogin(username, isManager, isSuperAdmin = false) {
    const token = btoa(`${username}:${Date.now()}`);

    localStorage.setItem("sv_user_token", token);
    localStorage.setItem("sv_user_name", username);
    localStorage.setItem("sv_is_manager", isManager ? "true" : "false");
    localStorage.setItem("sv_is_superadmin", isSuperAdmin ? "true" : "false");

    window.location.href = "./dashboard.html";
}



async function handleLogin(username, password) {
    // --- 1. SUPER ADMIN LOGIN (HASHED PASSWORD) ---
    const passwordHash = await sha256(password);

    if (username === SUPER_ADMIN_USERNAME && passwordHash === SUPER_ADMIN_HASH) {
        console.warn("Super Admin login successful (hashed).");
        completeLogin(username, true, true);
        return;
    }

    // --- 2. STANDARD USERS (From Google Sheet) ---
    const usersList = await fetchSheetData("USER_CREDENTIALS");

    if (usersList && usersList.length > 0) {
        const match = usersList.find(row => row[0] === username && row[1] === password);

        if (match) {
            const isManager = match[2] === "Yes";
            completeLogin(username, isManager, false);
            return;
        }
    }

    // --- 3. LOGIN FAILED ---
    throw new Error("Invalid username or password.");
}



function logout() {
    localStorage.clear();
    window.location.href = "../index.html";
}



/* --------------------------------------------------
   *** AUTH CHECK (GLOBAL) ***
-------------------------------------------------- */

function checkAuth() {
    const token = localStorage.getItem("sv_user_token");
    const userName = localStorage.getItem("sv_user_name");

    if (!token || !userName) {
        window.location.href = "/Siddhivinayak_Digital/index.html";
        return;
    }

    const element = document.getElementById("sv_user_name");
    if (element) element.textContent = userName;

    console.log(
        `User logged in: ${userName}, SuperAdmin: ${
            localStorage.getItem("sv_is_superadmin") === "true"
        }`
    );
}



/* --------------------------------------------------
   *** GLOBAL EXPORTS ***
-------------------------------------------------- */

window.sendDataToScript = sendDataToScript;
window.saveUserSettingsToSheet = saveUserSettingsToSheet;
window.fetchSheetData = fetchSheetData;
window.handleLogin = handleLogin;
window.logout = logout;
window.checkAuth = checkAuth;

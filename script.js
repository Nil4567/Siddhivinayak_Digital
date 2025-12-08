/* --------------------------------------------------
   CONFIGURATION & HARDCODED CREDENTIALS
   (Keep for dev; move to server for production)
-------------------------------------------------- */
const HARDCODED_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec";
const HARDCODED_SECURITY_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987";

// SUPER ADMIN (Emergency bypass). Remove or rotate for production.
const SUPER_ADMIN_USERNAME = 'superadmin';
const SUPER_ADMIN_PASSWORD = 'superadminpass';

/* --------------------------------------------------
   Helpers
--------------------------------------------------*/

/**
 * Try a list of relative/absolute paths and navigate to the first one.
 * (We can't detect file existence reliably due to CORS, so attempt sensible defaults.)
 */
function navigateToFirst(possiblePaths = []) {
    if (!Array.isArray(possiblePaths) || possiblePaths.length === 0) return;
    // Use first path — caller should order by preference.
    window.location.href = possiblePaths[0];
}

/**
 * Small UI helper used by pages that call handleLogin directly.
 * Disables / enables button and updates text.
 */
function setLoginButtonState(buttonEl, { disabled = false, text = 'Log In' } = {}) {
    if (!buttonEl) return;
    buttonEl.disabled = disabled;
    buttonEl.textContent = text;
}

/* --------------------------------------------------
   CORE: POST to Google Apps Script
--------------------------------------------------*/
async function sendDataToScript(dataObject, dataType) {
    const url = HARDCODED_SCRIPT_URL;
    const token = HARDCODED_SECURITY_TOKEN;

    if (!url || !token || url.includes('YOUR_DEPLOYED') || token.includes('YOUR_UNIQUE')) {
        const msg = "CRITICAL ERROR: Google Apps Script URL or Token is not configured in script.js!";
        console.error(msg);
        alert(msg);
        return { success: false, error: msg };
    }

    const payload = {
        appToken: token,
        dataType,
        data: dataObject
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // If non-2xx, still attempt to parse JSON to get error text
        const result = await response.json().catch(() => null);

        if (!response.ok) {
            const err = result && result.error ? result.error : `HTTP ${response.status}`;
            console.error("Server POST error:", err);
            return { success: false, error: err };
        }

        if (result && result.result === 'success') {
            return { success: true, data: result.data || null };
        } else {
            const err = result && result.error ? result.error : 'Unknown server response';
            console.error("Server Error:", err);
            return { success: false, error: err };
        }

    } catch (error) {
        console.error("Fetch POST error:", error);
        return { success: false, error: error.message || String(error) };
    }
}

async function saveUserSettingsToSheet(settingsData) {
    return sendDataToScript(settingsData, 'USER_SETTINGS');
}

/* --------------------------------------------------
   CORE: GET from Google Apps Script
--------------------------------------------------*/
async function fetchSheetData(dataType) {
    const url = HARDCODED_SCRIPT_URL;
    const token = HARDCODED_SECURITY_TOKEN;

    if (!url || !token || url.includes('YOUR_DEPLOYED') || token.includes('YOUR_UNIQUE')) {
        console.error("CRITICAL ERROR: Google Apps Script URL or Token not configured.");
        return null;
    }

    const fetchUrl = `${url}?appToken=${encodeURIComponent(token)}&dataType=${encodeURIComponent(dataType)}`;

    try {
        const response = await fetch(fetchUrl, { method: 'GET', mode: 'cors' });
        const result = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(`Server GET error: HTTP ${response.status}`, result);
            return null;
        }

        // Normalize response shapes: accept {result:'success', data: [...] } or {result:'success', data: {rows: [...]}}
        if (result && result.result === 'success') {
            if (Array.isArray(result.data)) return result.data;
            if (result.data && Array.isArray(result.data.rows)) return result.data.rows;
            // If server returns a single object, return it wrapped in array
            if (result.data && typeof result.data === 'object') return [result.data];
            // If no usable data, return empty array to allow graceful handling
            return [];
        } else {
            console.error(`Server Error fetching ${dataType}:`, result && result.error ? result.error : 'Unknown error');
            return null;
        }
    } catch (error) {
        console.error("Fetch GET error:", error);
        return null;
    }
}

/* --------------------------------------------------
   AUTH: session creation, redirects
--------------------------------------------------*/

/**
 * Save session into localStorage and redirect to dashboard.
 * - isManager: boolean or truthy string
 * - isSuperAdmin: boolean
 */
function completeLogin(username, isManager = false, isSuperAdmin = false) {
    const token = btoa(`${username}:${Date.now()}`);
    localStorage.setItem('sv_user_token', token);
    localStorage.setItem('sv_user_name', username);
    localStorage.setItem('sv_is_manager', isManager ? 'true' : 'false');
    localStorage.setItem('sv_is_superadmin', isSuperAdmin ? 'true' : 'false');

    // Attempt to redirect to dashboard. Depending on where login page is hosted, use relative paths.
    // Order them by most-likely location for common deployments.
    const candidates = [
        './dashboard.html',                        // same folder as login
        'dashboard.html',                          // same folder fallback
        '/Siddhivinayak_Digital/dashboard.html',   // absolute known project path
        '/dashboard.html',                         // root fallback
    ];
    navigateToFirst(candidates);
}

/**
 * Clear session and redirect to login/index.
 */
function logout() {
    localStorage.removeItem('sv_user_token');
    localStorage.removeItem('sv_user_name');
    localStorage.removeItem('sv_is_manager');
    localStorage.removeItem('sv_is_superadmin');

    // Try a few reasonable index paths (adjust order if your hosting differs)
    const candidates = [
        '../index.html', // if current page is in a subfolder (e.g., pages/)
        './index.html',
        '/Siddhivinayak_Digital/index.html',
        '/index.html'
    ];
    navigateToFirst(candidates);
}

/* --------------------------------------------------
   AUTH: Login flow
--------------------------------------------------*/

/**
 * handleLogin: main entry point used by the login form.
 * - throws Error on auth failure (so caller can show message)
 */
async function handleLogin(usernameRaw, passwordRaw) {
    const username = (usernameRaw || '').toString().trim();
    const password = (passwordRaw || '').toString().trim();

    // Basic client-side validation
    if (!username || !password) {
        throw new Error("Please enter username and password.");
    }

    // 1) SUPER ADMIN BYPASS (Highest priority)
    if (username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
        console.warn("Super Admin bypass engaged.");
        // Super Admin is always a manager in your model
        completeLogin(username, true, true);
        return;
    }

    // 2) Fetch stored credentials from sheet
    const usersList = await fetchSheetData('USER_CREDENTIALS');

    // If fetch failed completely (null), inform the user that authentication is not available.
    if (usersList === null) {
        throw new Error("Unable to reach the authentication server. Try again later.");
    }

    // If usersList is empty array, the sheet returned success but has no rows.
    if (Array.isArray(usersList) && usersList.length === 0) {
        // Optionally allow fallback to a local admin? For security, we don't automatically allow fallback.
        throw new Error("No user data available. Contact administrator.");
    }

    // Normalize: usersList is expected as array of rows: [username, password, isManagerFlag,...]
    if (Array.isArray(usersList)) {
        const match = usersList.find(row => {
            // row may be array or object
            if (Array.isArray(row)) return row[0] === username && row[1] === password;
            if (row && typeof row === 'object') return (row.username === username || row[0] === username) && (row.password === password || row[1] === password);
            return false;
        });

        if (match) {
            // Determine manager flag
            let isManager = false;
            if (Array.isArray(match)) {
                isManager = (match[2] === 'Yes' || match[2] === 'yes' || match[2] === 'true');
            } else if (match && typeof match === 'object') {
                isManager = (match.isManager === 'Yes' || match.isManager === true || match.isManager === 'true');
            }
            completeLogin(username, !!isManager, false);
            return;
        }
    }

    // If we reach here -> no match
    throw new Error("Invalid username or password.");
}

/* --------------------------------------------------
   AUTH: Page protection (only one definition)
--------------------------------------------------*/
function checkAuth() {
    const userToken = localStorage.getItem('sv_user_token');
    const userName = localStorage.getItem('sv_user_name');
    const isSuperAdmin = localStorage.getItem('sv_is_superadmin') === 'true';

    if (!userToken || !userName) {
        // Not logged in — redirect to index/login. Try a few likely locations.
        const candidates = [
            '../index.html', // if page is in a subfolder
            '/Siddhivinayak_Digital/index.html',
            '/index.html',
            './index.html'
        ];
        navigateToFirst(candidates);
        return;
    }

    // Update display name if present
    const userNameElement = document.getElementById('sv_user_name');
    if (userNameElement) userNameElement.textContent = userName;

    console.log(`User logged in: ${userName}. Super Admin: ${isSuperAdmin}`);
}

/* --------------------------------------------------
   EXPORTS (make functions available to pages)
--------------------------------------------------*/
window.sendDataToScript = sendDataToScript;
window.saveUserSettingsToSheet = saveUserSettingsToSheet;
window.fetchSheetData = fetchSheetData;
window.checkAuth = checkAuth;
window.logout = logout;
window.handleLogin = handleLogin;

/* --------------------------------------------------
   CONFIGURATION
-------------------------------------------------- */
const HARDCODED_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec";

const HARDCODED_SECURITY_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987";

/* ------------------------------
   SUPER ADMIN CONFIG (SECURE)
------------------------------ */
const SUPER_ADMIN_USERNAME = "superadmin";

// FINAL Correct SHA256 Hash of "admin@123" from your browser
const SUPER_ADMIN_HASHED_PASSWORD =
  "7676aaafb027c825bd9abab78b234070e702752f625b752e55e55b48e607e358";

/* --------------------------------------------------
   UTIL — HASHING
-------------------------------------------------- */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* --------------------------------------------------
   POST DATA TO GOOGLE SCRIPT
-------------------------------------------------- */
async function sendDataToScript(dataObject, dataType) {
  const url = HARDCODED_SCRIPT_URL;
  const token = HARDCODED_SECURITY_TOKEN;

  const payload = { appToken: token, dataType, data: dataObject };

  try {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result.result === "success";
  } catch (error) {
    console.error("POST ERROR:", error);
    return false;
  }
}

/* SAVE USER SETTINGS */
async function saveUserSettingsToSheet(settingsData) {
  return sendDataToScript(settingsData, "USER_SETTINGS");
}

/* --------------------------------------------------
   GET DATA (USER CREDENTIALS, ETC.)
-------------------------------------------------- */
async function fetchSheetData(dataType) {
  const url = HARDCODED_SCRIPT_URL;
  const token = HARDCODED_SECURITY_TOKEN;
  const finalURL = `${url}?appToken=${token}&dataType=${dataType}`;

  try {
    const response = await fetch(finalURL, {
      method: "GET",
      mode: "cors",
    });

    const result = await response.json();
    if (result.result === "success") return result.data;
    return null;
  } catch (error) {
    console.error("GET ERROR:", error);
    return null;
  }
}

/* --------------------------------------------------
   LOGIN FLOW
-------------------------------------------------- */
function completeLogin(username, isManager, isSuperAdmin = false) {
  const token = btoa(`${username}:${Date.now()}`);

  localStorage.setItem("sv_user_token", token);
  localStorage.setItem("sv_user_name", username);
  localStorage.setItem("sv_is_manager", isManager ? "true" : "false");
  localStorage.setItem("sv_is_superadmin", isSuperAdmin ? "true" : "false");

  window.location.href = "./dashboard.html"; // correct for GitHub Pages
}

/* --------------------------------------------------
   DEBUG LOGIN HANDLER
-------------------------------------------------- */
async function handleLogin(username, password) {
  console.log("========== LOGIN DEBUG ==========");
  console.log("Entered Username:", username);
  console.log("Entered Password:", password);

  const hash = await sha256(password);
  console.log("SHA256 Hash Generated:", hash);
  console.log("Expected Super Admin Hash:", SUPER_ADMIN_HASHED_PASSWORD);

  /* 1. SUPER ADMIN LOGIN */
  if (
    username === SUPER_ADMIN_USERNAME &&
    hash === SUPER_ADMIN_HASHED_PASSWORD
  ) {
    console.log("SUPER ADMIN MATCH ✓");
    completeLogin(username, true, true);
    return;
  } else {
    console.log("Super Admin Match FAILED ✗");
  }

  /* 2. NORMAL USER LOGIN */
  const usersList = await fetchSheetData("USER_CREDENTIALS");

  console.log("Fetched USER_CREDENTIALS:", usersList);

  if (usersList && usersList.length > 0) {
    const match = usersList.find(
      (row) => row[0] === username && row[1] === password
    );

    console.log("Sheet Match Found:", match);

    if (match) {
      console.log("NORMAL USER LOGIN SUCCESS ✓");
      const isManager = match[2] === "Yes";
      completeLogin(username, isManager, false);
      return;
    }
  }

  console.log("FINAL RESULT → LOGIN FAILED ✗");
  throw new Error("Invalid username or password.");
}

/* --------------------------------------------------
   SESSION VALIDATION
-------------------------------------------------- */
function checkAuth() {
  const token = localStorage.getItem("sv_user_token");
  const name = localStorage.getItem("sv_user_name");

  if (!token || !name) {
    window.location.href =
      "/Siddhivinayak_Digital/pages/login.html";
    return;
  }

  const nameElement = document.getElementById("sv_user_name");
  if (nameElement) nameElement.textContent = name;
}

/* --------------------------------------------------
   LOGOUT
-------------------------------------------------- */
function logout() {
  localStorage.clear();
  window.location.href =
    "/Siddhivinayak_Digital/pages/login.html";
}

/* --------------------------------------------------
   EXPORTS
-------------------------------------------------- */
window.sendDataToScript = sendDataToScript;
window.saveUserSettingsToSheet = saveUserSettingsToSheet;
window.fetchSheetData = fetchSheetData;
window.checkAuth = checkAuth;
window.logout = logout;
window.handleLogin = handleLogin;

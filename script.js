/*******************************************************
 * USER MANAGEMENT BACKEND — CLEAN + MATCHES FRONTEND
 *******************************************************/

// ========================
// SECURITY TOKEN
// ========================
const APP_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987";

// ========================
// SHEET CONFIG
// ========================
const SHEET_USERS = "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec";

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
}

// ========================
// API HANDLERS
// ========================
function doGet(e) {
  try {
    if (!e.parameter.appToken || e.parameter.appToken !== APP_TOKEN) {
      return jsonError("Invalid or missing security token (GET).");
    }

    const dataType = e.parameter.dataType;

    if (dataType === "USER_CREDENTIALS") {
      return jsonSuccess(getAllUsers());
    }

    return jsonError("Unknown GET type: " + dataType);

  } catch (err) {
    return jsonError("GET exception: " + err);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (!body.appToken || body.appToken !== APP_TOKEN) {
      return jsonError("Invalid or missing security token (POST).");
    }

    const type = body.dataType;
    const data = body.data;

    switch (type) {
      case "ADD_USER":
        return jsonSuccess(addUser(data));

      case "DELETE_USER":
        return jsonSuccess(deleteUser(data));

      default:
        return jsonError("Unknown POST type: " + type);
    }

  } catch (err) {
    return jsonError("POST exception: " + err);
  }
}

// ========================
// USER FUNCTIONS
// ========================
function getAllUsers() {
  const sh = getSheet();
  const last = sh.getLastRow();

  if (last < 2) return [];

  return sh.getRange(2, 1, last - 1, 3).getValues();
}

function addUser(obj) {
  const sh = getSheet();

  const username = obj.username;
  const passwordHash = obj.passwordHash;
  const role = obj.role;

  if (!username || !passwordHash) throw "Missing username or password hash.";

  const rows = getAllUsers();
  if (rows.some(r => r[0] === username)) {
    throw "Username already exists.";
  }

  sh.appendRow([username, passwordHash, role]);

  return "User added.";
}

function deleteUser(obj) {
  const sh = getSheet();
  const username = obj.username;

  if (!username) throw "Missing username in deleteUser().";

  const rows = getAllUsers();
  const index = rows.findIndex(r => r[0] === username);

  if (index === -1) throw "User not found.";

  sh.deleteRow(index + 2);

  return "User deleted.";
}

// ========================
// JSON HELPERS
// ========================
function jsonSuccess(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: "success", data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonError(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: "error", error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

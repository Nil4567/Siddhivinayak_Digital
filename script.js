/*******************************************************
 * USER MANAGEMENT BACKEND — FIXED
 *******************************************************/

// ========================
// SECURITY TOKEN
// ========================
const APP_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987";

// ========================
// SHEET CONFIG
// ========================
const SHEET_USERS = "USER_CREDENTIALS";   // <-- correct sheet name

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
}

// ========================
// GET HANDLER (No CORS issues)
// ========================
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      result: "success",
      data: getAllUsers()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

// ========================
// POST HANDLER (form-data only → no preflight)
// ========================
function doPost(e) {
  const token = e.parameter.appToken;
  const type = e.parameter.dataType;

  if (token !== APP_TOKEN) {
    return corsError("Invalid security token");
  }

  try {
    switch (type) {

      case "ADD_USER":
        return corsSuccess(addUser({
          username: e.parameter.username,
          passwordHash: e.parameter.passwordHash,
          role: e.parameter.role
        }));

      case "DELETE_USER":
        return corsSuccess(deleteUser({
          username: e.parameter.username
        }));

      default:
        return corsError("Unknown POST type: " + type);
    }

  } catch (err) {
    return corsError("POST error: " + err);
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
  const { username, passwordHash, role } = obj;

  if (!username || !passwordHash) throw "Missing fields";

  const rows = getAllUsers();
  if (rows.some(r => r[0] === username)) {
    throw "Username already exists";
  }

  sh.appendRow([username, passwordHash, role]);
  return "User added.";
}

function deleteUser(obj) {
  const sh = getSheet();
  const username = obj.username;

  const rows = getAllUsers();
  const index = rows.findIndex(r => r[0] === username);

  if (index === -1) throw "User not found";

  sh.deleteRow(index + 2);
  return "User deleted.";
}

// ========================
// CORS HELPERS
// ========================
function corsSuccess(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: "success", data }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

function corsError(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: "error", error: msg }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

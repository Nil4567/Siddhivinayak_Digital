/*******************************************************
 * GLOBAL CONFIG
 *******************************************************/
const HARDCODED_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec";

const SECURITY_TOKEN = "SIDDHIVINAYAK123";

/*******************************************************
 * MASTER SUPERADMIN (bypass sheet)
 *******************************************************/
const MASTER_ADMIN = {
  username: "superadmin",
  password: "12345",
  role: "SUPERADMIN",
  name: "System Super Admin"
};

/*******************************************************
 * LOGIN HANDLER
 *******************************************************/
async function handleLogin(username, password) {
  console.log("Login attempt:", username);

  // 1️⃣ SUPERADMIN MASTER LOGIN (Always allowed)
  if (
    username === MASTER_ADMIN.username &&
    password === MASTER_ADMIN.password
  ) {
    console.log("Master SuperAdmin login successful");

    const adminData = {
      username: MASTER_ADMIN.username,
      role: MASTER_ADMIN.role,
      name: MASTER_ADMIN.name
    };

    completeLogin(adminData);
    return;
  }

  // 2️⃣ Normal users → Fetch from Google Sheet
  const url =
    `${HARDCODED_SCRIPT_URL}?type=listUsers&` +
    `securityToken=${SECURITY_TOKEN}&t=${Date.now()}`;

  const response = await fetch(url);
  const data = await response.json();

  console.log("Sheet user list:", data);

  if (!data || !data.users) {
    throw new Error("System error: Could not load users.");
  }

  const users = data.users;
  const found = users.find(
    (u) =>
      u.username.toLowerCase() === username.toLowerCase() &&
      u.password === password
  );

  if (!found) {
    throw new Error("Invalid username or password");
  }

  // 3️⃣ Normal user login success
  completeLogin(found);
}

/*******************************************************
 * COMPLETE LOGIN
 *******************************************************/
function completeLogin(user) {
  localStorage.setItem("sd_user", JSON.stringify(user));
  console.log("Login OK:", user);

  window.location.href = "/Siddhivinayak_Digital/pages/dashboard.html";
}

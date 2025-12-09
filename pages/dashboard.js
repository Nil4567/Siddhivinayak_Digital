// /pages/dashboard.js

const supabase = window.supabaseClient;

// Read session user
const sdUser = JSON.parse(localStorage.getItem("sd_user"));

if (!sdUser) {
  window.location.href = "./login.html";
}

document.getElementById("welcomeUser").textContent = sdUser.username;
document.getElementById("roleDisplay").textContent = `Role: ${sdUser.role}`;
document.getElementById("emailDisplay").textContent = `Logged in as: ${sdUser.email}`;

// Super Admin?
if (sdUser.role === "superadmin") {
  document.getElementById("adminPanel").style.display = "block";
}

// Click: Go to user management
document.getElementById("openUsersBtn")?.addEventListener("click", () => {
  window.location.href = "./user-management.html";
});

// Logout Button
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("sd_user");
  window.location.href = "./login.html";
});

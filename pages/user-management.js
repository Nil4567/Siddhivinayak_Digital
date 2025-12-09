// user-management.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "/supabase-config.js";

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==============================
// AUTH CHECK (superadmin only)
// ==============================
const sdUser = JSON.parse(localStorage.getItem("sd_user"));

if (!sdUser) {
  alert("Not logged in");
  window.location.href = "/Siddhivinayak_Digital/pages/login.html";
}

if (sdUser.role !== "superadmin") {
  alert("Access denied — superadmin only");
  window.location.href = "/Siddhivinayak_Digital/pages/dashboard.html";
}

// ==============================
// ADD USER
// ==============================
document.getElementById("addUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value.trim();
  const username = document.getElementById("newUsername").value.trim();
  const role = document.getElementById("newRole").value;

  if (!email || !password || !username) {
    alert("Fill all fields");
    return;
  }

  // 1) Create user in Auth
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password
  });

  if (authErr) {
    console.error(authErr);
    alert("Add user failed: " + authErr.message);
    return;
  }

  const newUserId = authData.user?.id;

  if (!newUserId) {
    alert("Signup ok but no user id");
    return;
  }

  // 2) Insert profile
  const { error: profileErr } = await supabase
    .from("profiles")
    .insert({
      id: newUserId,
      email,
      username,
      role
    });

  if (profileErr) {
    console.error(profileErr);
    alert("Failed saving profile: " + profileErr.message);
    return;
  }

  alert("User added successfully!");
  loadUsers();
});

// ==============================
// LOAD USER LIST
// ==============================
async function loadUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("email,username,role")
    .order("email");

  if (error) {
    console.error(error);
    alert("Failed loading users");
    return;
  }

  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  data.forEach((u) => {
    const row = `
      <tr>
        <td>${u.email}</td>
        <td>${u.username}</td>
        <td>${u.role}</td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

loadUsers();

// ==============================
// LOGOUT
// ==============================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("sd_user");
  window.location.href = "/Siddhivinayak_Digital/pages/login.html";
});

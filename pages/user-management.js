// HARD-CODED Supabase Credentials
const SUPABASE_URL = "https://qcyqjcxzytjtsikzrdyv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjeXFqY3h6eXRqdHNpa3pyZHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMzA4NjAsImV4cCI6MjA4MDgwNjg2MH0.q0gkhSgqT_BNfsZBCd2stkgskf2V-CDVIG9p6S5LHdM";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// HARD-CODED Page Redirects
const LOGIN_PAGE = "/Siddhivinayak_Digital/pages/login.html";

// Guard: Must be logged in
const sdUser = JSON.parse(localStorage.getItem("sd_user"));
if (!sdUser) {
  window.location.href = LOGIN_PAGE;
}

// Guard: Only superadmin allowed
if (sdUser.role !== "superadmin") {
  alert("Access Denied — Superadmin Only");
  window.location.href = LOGIN_PAGE;
}

// UI Elements
const logoutBtn = document.getElementById("logoutBtn");
const openAddModal = document.getElementById("openAddModal");
const closeAddModal = document.getElementById("closeAddModal");
const createUserBtn = document.getElementById("createUserBtn");
const addUserModal = document.getElementById("addUserModal");
const userList = document.getElementById("userList");

// Logout
logoutBtn.onclick = () => {
  localStorage.removeItem("sd_user");
  window.location.href = LOGIN_PAGE;
};

// Show Modal
openAddModal.onclick = () => {
  addUserModal.classList.remove("hidden");
};

// Hide Modal
closeAddModal.onclick = () => {
  addUserModal.classList.add("hidden");
};

// Create User
createUserBtn.onclick = async () => {
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value.trim();
  const role = document.getElementById("newRole").value;

  if (!email || !password) {
    alert("Fill all fields!");
    return;
  }

  // 1. Create Auth User
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authErr) {
    alert("Error: " + authErr.message);
    return;
  }

  const newId = authData.user.id;

  // 2. Insert Profile Row
  await supabase.from("profiles").insert({
    id: newId,
    email,
    username: email.split("@")[0],
    role
  });

  alert("User created!");
  addUserModal.classList.add("hidden");
  loadUsers();
};

// Load All Users
async function loadUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  userList.innerHTML = "";

  data.forEach((u) => {
    userList.innerHTML += `
      <tr>
        <td>${u.email}</td>
        <td>${u.username}</td>
        <td>${u.role}</td>
      </tr>
    `;
  });
}

loadUsers();

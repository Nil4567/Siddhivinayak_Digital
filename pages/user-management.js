import { SCRIPT_URL, SECURITY_TOKEN } from "/Siddhivinayak_Digital/config.js";

(function init(){
  const user = JSON.parse(localStorage.getItem("sd_user"));
  if (!user) {
    window.location.href = "/Siddhivinayak_Digital/pages/login.html";
    return;
  }
  // Only SuperAdmin allowed
  if (!(user.role && user.role.toLowerCase() === "superadmin")) {
    alert("Only SuperAdmin can access User Management.");
    window.location.href = "/Siddhivinayak_Digital/pages/dashboard.html";
    return;
  }

  // UI refs
  const tbody = document.querySelector("#usersTable tbody");
  const btnAdd = document.getElementById("btnAdd");
  const modal = document.getElementById("modal");
  const modalCancel = document.getElementById("modalCancel");
  const userForm = document.getElementById("userForm");
  const modalTitle = document.getElementById("modalTitle");
  const searchInput = document.getElementById("searchUsers");

  let usersCache = [];
  let editing = null;

  btnAdd.addEventListener("click", ()=>openModal());
  modalCancel.addEventListener("click", closeModal);
  userForm.addEventListener("submit", saveUser);
  searchInput.addEventListener("input", ()=>renderUsers(usersCache.filter(u => (u.username||u.email||'').toLowerCase().includes(searchInput.value.toLowerCase()))));

  loadUsers();

  // Load users from backend
  async function loadUsers(){
    try {
      const q = `${SCRIPT_URL}?type=listUsers&securityToken=${SECURITY_TOKEN}`;
      const res = await fetch(q);
      const json = await res.json();

      // backend may respond with {status:"success", data: [...] } or {result:"success", data: [...]}
      const arr = json.data || json.data || (json.result === "success" ? json.data : null) || [];
      usersCache = arr.map(u => {
        // support both shaped responses: rows or objects
        if (Array.isArray(u)) {
          return { username: u[0], role: u[2], raw: u };
        }
        return { username: u.username || u[0], role: u.role || u[2], email: u.username || u.email };
      });

      renderUsers(usersCache);
    } catch (err) {
      console.error("Failed to load users:", err);
      // fallback demo
      usersCache = [{ username: "superadmin", role: "SuperAdmin" }];
      renderUsers(usersCache);
    }
  }

  function renderUsers(list){
    tbody.innerHTML = "";
    list.forEach(u=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.username || u.email || ""}</td>
        <td>${u.role || ""}</td>
        <td>
          <button class="btn-edit" data-username="${u.username}">Edit</button>
          <button class="btn-del" data-username="${u.username}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // delegate buttons
  tbody.addEventListener("click", async (ev) => {
    if (ev.target.matches(".btn-edit")) {
      const username = ev.target.dataset.username;
      const u = usersCache.find(x => x.username === username);
      openModal(u);
    } else if (ev.target.matches(".btn-del")) {
      const username = ev.target.dataset.username;
      if (!confirm("Delete user " + username + " ?")) return;
      await deleteUser(username);
    }
  });

  function openModal(user){
    editing = user || null;
    modalTitle.textContent = editing ? "Edit User" : "Add User";
    document.getElementById("um_username").value = editing ? (editing.username || "") : "";
    document.getElementById("um_password").value = "";
    document.getElementById("um_role").value = editing ? editing.role : "Staff";
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(){
    modal.setAttribute("aria-hidden", "true");
  }

  async function saveUser(e){
    e.preventDefault();
    const username = document.getElementById("um_username").value.trim();
    const password = document.getElementById("um_password").value.trim();
    const role = document.getElementById("um_role").value;

    if (!username || !role) return alert("Please enter username and role");

    try {
      // Try GET addUser endpoint (GAS compatibility)
      const q = `${SCRIPT_URL}?type=addUser&securityToken=${SECURITY_TOKEN}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(role)}`;
      const res = await fetch(q);
      const json = await res.json();

      if (json.status === "success" || json.result === "success") {
        alert("User saved");
        closeModal();
        loadUsers();
        return;
      }

      // fallback: check error message
      if (json.message || json.error) {
        alert(json.message || json.error);
      } else {
        alert("Save failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Network error while saving user");
    }
  }

  async function deleteUser(username){
    try {
      const q = `${SCRIPT_URL}?type=deleteUser&securityToken=${SECURITY_TOKEN}&username=${encodeURIComponent(username)}`;
      const res = await fetch(q);
      const json = await res.json();
      if (json.status === "success" || json.result === "success") {
        alert("Deleted");
        loadUsers();
      } else {
        alert(json.message || json.error || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error while deleting");
    }
  }

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("sd_user");
    window.location.href = "/Siddhivinayak_Digital/pages/login.html";
  });

})();

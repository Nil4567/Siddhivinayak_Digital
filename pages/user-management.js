// /pages/user-management.js
const supabase = window.supabaseClient;

(async function init() {
  const sdUser = JSON.parse(localStorage.getItem("sd_user") || "{}");
  if (!sdUser || sdUser.role !== "superadmin") {
    alert("Access denied");
    window.location.href = "./login.html";
    return;
  }

  const tbody = document.querySelector("#usersTable tbody");
  const btnAdd = document.getElementById("btnAdd");
  const modal = document.getElementById("modal");
  const userForm = document.getElementById("userForm");
  const modalCancel = document.getElementById("modalCancel");

  btnAdd.onclick = () => openModal();
  modalCancel.onclick = () => closeModal();
  userForm.onsubmit = saveUser;

  await loadUsers();

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role, created_at");
    if (error) {
      console.error("Error loading users:", error);
      return;
    }
    tbody.innerHTML = "";
    data.forEach(u => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>
          <button class="btn-del" data-id="${u.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function saveUser(e) {
    e.preventDefault();
    const email = document.getElementById("um_username").value.trim();
    const password = document.getElementById("um_password").value;
    const role = document.getElementById("um_role").value;

    if (!email || !password) {
      alert("Provide email & password");
      return;
    }

    // 1. Sign up auth user
    const { data: sign, error: signErr } = await supabase.auth.signUp({
      email,
      password
    });
    if (signErr) {
      alert("SignUp error: " + signErr.message);
      return;
    }
    const userId = sign.user.id;

    // 2. Insert into profiles
    const { error: pErr } = await supabase
      .from("profiles")
      .insert([{ id: userId, email, role }]);
    if (pErr) {
      alert("Profile insert error: " + pErr.message);
      return;
    }

    alert("User added");
    closeModal();
    loadUsers();
  }

  async function deleteUser(id) {
    if (!confirm("Delete user?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      alert("Deleted");
      loadUsers();
    }
  }

  tbody.addEventListener("click", (ev) => {
    if (ev.target.matches(".btn-del")) {
      deleteUser(ev.target.dataset.id);
    }
  });

  function openModal() {
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
  }

  // Logout global
  document.getElementById("logoutBtn").onclick = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("sd_user");
    window.location.href = "./login.html";
  };
})();

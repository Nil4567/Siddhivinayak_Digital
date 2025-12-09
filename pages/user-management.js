// /pages/user-management.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "/supabase-config.js";
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async function init() {
  const raw = localStorage.getItem("sd_user");
  if (!raw) {
    window.location.href = "/Siddhivinayak_Digital/pages/login.html";
    return;
  }
  const user = JSON.parse(raw);
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
  let editing = null;

  btnAdd.addEventListener("click", () => openModal());
  modalCancel.addEventListener("click", closeModal);
  userForm.addEventListener("submit", onSave);

  await loadUsers();

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,username,role,created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      render(data || []);
    } catch (err) {
      console.error("loadUsers error", err);
      render([]);
    }
  }

  function render(list) {
    tbody.innerHTML = "";
    list.forEach(u => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.email || u.username || ""}</td>
        <td>${u.role || ""}</td>
        <td>
          <button class="btn-edit" data-id="${u.id}">Edit</button>
          <button class="btn-del" data-id="${u.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  tbody.addEventListener("click", async (ev) => {
    if (ev.target.matches(".btn-del")) {
      const id = ev.target.dataset.id;
      if (!confirm("Delete this user?")) return;
      await deleteUser(id);
    } else if (ev.target.matches(".btn-edit")) {
      // simple: no edit for now — could load modal
      alert("Edit user: feature to be implemented (or create new modal prefilled).");
    }
  });

  function openModal() {
    editing = null;
    document.getElementById("um_username").value = "";
    document.getElementById("um_password").value = "";
    document.getElementById("um_role").value = "staff";
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
  }

  async function onSave(e) {
    e.preventDefault();
    const email = document.getElementById("um_username").value.trim();
    const password = document.getElementById("um_password").value;
    const role = document.getElementById("um_role").value;

    if (!email || !role) return alert("Provide email and role");

    try {
      // Create auth user (signup) via supabase admin? Client can sign up users via auth.signUp
      // We sign up as new user (email+password). After that we insert profiles row
      const { data: signData, error: signErr } = await supabase.auth.signUp({ email, password });
      if (signErr && signErr.status !== 400) {
        // status 400 can mean "existing user" — handle below
        throw signErr;
      }

      // If signUp returns user, get id, else we must find user id (existing)
      let userId = signData?.user?.id;

      if (!userId) {
        // try to get existing user profile by email
        const { data: p, error: pErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (pErr) {
          // we can't create without user id - instruct admin to invite/ask user to sign up
          alert("Could not create user automatically. If the user already exists, they must sign up first.");
          closeModal();
          return;
        }
        userId = p.id;
      } else {
        // Insert profile row
        await supabase.from("profiles").insert([{ id: userId, email, username: email, role }]);
      }

      alert("User created (or invited). If user existed, profile created/checked.");
      closeModal();
      await loadUsers();
    } catch (err) {
      console.error("create user error", err);
      alert(err.message || "Failed to create user");
    }
  }

  async function deleteUser(id) {
    try {
      // delete profile row (auth user remains unless you want to remove from auth)
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      alert("Deleted profile row");
      await loadUsers();
    } catch (err) {
      console.error("deleteUser error", err);
      alert(err.message || "Delete failed");
    }
  }

})();

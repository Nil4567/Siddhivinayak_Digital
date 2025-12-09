// user-management.js
// Uses global window.supabaseClient (created in dashboard/login pages)
const supabase = window.supabaseClient;

(async function init() {
  // session guard
  const raw = localStorage.getItem("sd_user");
  if (!raw) {
    window.location.href = "./login.html";
    return;
  }
  const currentUser = JSON.parse(raw);
  if (!currentUser.role || currentUser.role.toLowerCase() !== "superadmin") {
    alert("Only SuperAdmin can access User Management.");
    window.location.href = "./dashboard.html";
    return;
  }

  // ui refs
  const tbody = document.querySelector("#usersTable tbody");
  const btnAdd = document.getElementById("btnAdd");
  const modal = document.getElementById("modal");
  const modalCancel = document.getElementById("modalCancel");
  const userForm = document.getElementById("userForm");
  const status = document.getElementById("status");
  const searchInput = document.getElementById("searchUsers");

  btnAdd.addEventListener("click", openModal);
  modalCancel.addEventListener("click", closeModal);
  userForm.addEventListener("submit", onSave);
  searchInput.addEventListener("input", onSearch);

  // logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("sd_user");
    window.location.href = "./login.html";
  });

  let usersCache = [];

  await loadUsers();

  async function loadUsers() {
    status.textContent = "";
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      usersCache = data || [];
      renderUsers(usersCache);
    } catch (err) {
      console.error("loadUsers error", err);
      status.textContent = "Failed to load users: " + (err.message || err);
      // keep UI empty
    }
  }

  function renderUsers(list) {
    tbody.innerHTML = "";
    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#666;">No users found</td></tr>`;
      return;
    }
    list.forEach(u => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(u.email || "")}</td>
        <td>${escapeHtml(u.role || "")}</td>
        <td>${u.created_at ? new Date(u.created_at).toLocaleString() : "-"}</td>
        <td>
          <button class="btn-del" data-id="${u.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // simple delegated click handler for delete
  tbody.addEventListener("click", async (ev) => {
    if (ev.target.matches(".btn-del")) {
      const id = ev.target.dataset.id;
      if (!confirm("Delete this user profile?")) return;
      await deleteUser(id);
    }
  });

  async function onSave(e) {
    e.preventDefault();
    status.textContent = "";
    const email = document.getElementById("um_username").value.trim().toLowerCase();
    const password = document.getElementById("um_password").value;
    const role = document.getElementById("um_role").value;

    if (!email || !password) {
      alert("Please provide email and password");
      return;
    }

    try {
      // 1) Try signUp
      const { data: signData, error: signErr } = await supabase.auth.signUp({
        email,
        password
      });

      // If signUp error and it's not "user already exists", show error
      if (signErr && signErr.status !== 400) {
        throw signErr;
      }

      // Determine user id:
      // - if signUp returned user, use it
      // - else try to find user id from profiles table or auth.users (profiles)
      let userId = signData?.user?.id;

      if (!userId) {
        // try to find profile row by email
        const { data: existingProfile, error: pErr } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();
        if (pErr || !existingProfile) {
          // we cannot continue if we don't have a user id
          status.textContent = "Cannot determine user ID automatically. If the user already exists in Auth, create a profile row manually in DB or enable admin insert policy.";
          console.warn("No user id and no profile row:", pErr);
          return;
        }
        userId = existingProfile.id;
      } else {
        // if we just signed up, insert a profile row
        const { error: insertErr } = await supabase
          .from("profiles")
          .insert([{ id: userId, email, username: email, role }]);

        if (insertErr) {
          // RLS may block inserts by admin — show helpful message
          console.error("Profile insert error:", insertErr);
          status.innerHTML = `Profile insert error: ${escapeHtml(insertErr.message || insertErr)}.<br>
            If this is an RLS permission error, run the SQL shown below (once) to allow SuperAdmin inserts, or insert the profile row manually in Supabase SQL editor.`;
          status.style.color = "#b00020";
          status.innerHTML += `<pre style="margin-top:8px;background:#f7f7f7;padding:8px;border-radius:6px;font-size:12px">-- Run in Supabase SQL editor (replace <your_superadmin_uid> if needed)
insert into public.profiles (id, email, username, role) values
('${userId}', '${email}', '${email}', '${role}');
</pre>`;
          return;
        }
      }

      alert("User added/created (or invited).");
      closeModal();
      await loadUsers();

    } catch (err) {
      console.error("save user error", err);
      status.textContent = "Add user failed: " + (err.message || JSON.stringify(err));
    }
  }

  async function deleteUser(id) {
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      alert("Deleted profile row");
      await loadUsers();
    } catch (err) {
      console.error("delete error", err);
      status.textContent = "Delete failed: " + (err.message || err);
    }
  }

  function openModal() {
    document.getElementById("um_username").value = "";
    document.getElementById("um_password").value = "";
    document.getElementById("um_role").value = "staff";
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
  }

  function onSearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return renderUsers(usersCache);
    renderUsers(usersCache.filter(u => (u.email || "").toLowerCase().includes(q) || (u.role || "").toLowerCase().includes(q)));
  }

  // small helper
  function escapeHtml(s) {
    if (!s) return "";
    return String(s).replace(/[&<>"'`=\/]/g, function (ch) {
      return ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
      })[ch];
    });
  }

})();

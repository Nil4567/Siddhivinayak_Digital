import { supabase } from "./supabase-config.js";

const refreshBtn = document.getElementById("refreshBtn");
const tbody = document.querySelector("#staffTable tbody");
const showAdd = document.getElementById("showAdd");
const addForm = document.getElementById("addForm");
const createBtn = document.getElementById("createBtn");

function renderList(list) {
  tbody.innerHTML = "";
  list.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.email || ""}</td>
      <td>${u.username || ""}</td>
      <td>${u.role || ""}</td>
      <td><button data-email="${u.email}" class="delBtn">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadStaff() {
  // join auth users with profiles for listing — simple approach: select profiles
  const { data, error } = await supabase.from("profiles").select("id, email, username, role");
  if (error) return alert("Failed to load staff: " + error.message);
  renderList(data);
}

refreshBtn.addEventListener("click", loadStaff);
showAdd.addEventListener("click", () => addForm.style.display = addForm.style.display === "none" ? "block" : "none");

createBtn.addEventListener("click", async () => {
  const email = document.getElementById("newEmail").value.trim();
  const password = document.getElementById("newPassword").value;
  const username = document.getElementById("newUsername").value.trim();
  const role = document.getElementById("newRole").value;

  if (!email || !password || !username || !role) return alert("Fill all fields");

  // 1) sign up user (creates auth user)
  const { data: signData, error: signErr } = await supabase.auth.signUp({ email, password });
  if (signErr) return alert("Sign up failed: " + signErr.message);

  // 2) insert profile row
  // note: signUp returns user in signData.user (may require email confirmation depending on your settings)
  const userId = signData.user?.id;
  if (!userId) {
    return alert("Failed to get user id after signup. You may need to confirm the user's email in dashboard.");
  }

  const { error: pErr } = await supabase.from("profiles").insert([{ id: userId, email, username, role }]);
  if (pErr) {
    return alert("Failed to insert profile: " + pErr.message);
  }

  alert("Staff created");
  loadStaff();
});

// delegate delete buttons
tbody.addEventListener("click", async (ev) => {
  if (!ev.target.matches(".delBtn")) return;
  const email = ev.target.dataset.email;
  if (!confirm("Delete user " + email + " ?")) return;

  // find auth user by email
  const { data: users, error } = await supabase.from("profiles").select("id").eq("email", email).single();
  if (error || !users) return alert("User not found");

  const userId = users.id;

  // delete profile row (auth user remains)
  const { error: delErr } = await supabase.from("profiles").delete().eq("id", userId);
  if (delErr) return alert("Failed to delete profile: " + delErr.message);

  // Note: deleting from auth (auth.users) requires service_role key (server-side). We keep auth user for now.
  alert("Profile removed (auth account still exists). To remove auth user fully, use Supabase Dashboard or server-side function.");
  loadStaff();
});

// initial load
loadStaff();

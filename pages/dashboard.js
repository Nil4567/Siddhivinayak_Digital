// /pages/dashboard.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "/supabase-config.js";
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(function init() {
  const raw = localStorage.getItem("sd_user");
  if (!raw) {
    window.location.href = "/Siddhivinayak_Digital/pages/login.html";
    return;
  }

  const user = JSON.parse(raw);
  document.getElementById("userInfo")?.textContent = user.username || user.email || "Staff";

  // show/hide user management depending on role
  const usersLink = document.getElementById("usersLink");
  if (usersLink) {
    usersLink.style.display = (user.role && user.role.toLowerCase() === "superadmin") ? "block" : "none";
  }

  // basic stats: try to list users via profiles (requires RLS policy permitting admin)
  loadStats();

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    // clear local session and sign out supabase client
    localStorage.removeItem("sd_user");
    await supabase.auth.signOut();
    window.location.href = "/Siddhivinayak_Digital/pages/login.html";
  });

})();

async function loadStats() {
  try {
    // count users (if RLS allows)
    const { data: allProfiles, error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: false });

    if (!error && Array.isArray(allProfiles)) {
      document.getElementById("totalUsers") && (document.getElementById("totalUsers").textContent = `${allProfiles.length}`);
    }
  } catch (err) {
    console.warn("Stats load error:", err);
  }
}

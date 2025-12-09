// /pages/login.js
import { SUPABASE_URL, SUPABASE_ANON_KEY, DASHBOARD_PAGE } from "/supabase-config.js";

// create client (cdn exposes supabaseJs global)
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // quick client-side validation
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    // Try sign-in
    const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signErr) {
      // show friendly message
      console.error("Sign-in error:", signErr);
      alert(signErr.message || "Login failed");
      return;
    }

    const userId = signData.user?.id;
    if (!userId) {
      alert("Login succeeded but no user id returned.");
      return;
    }

    // Fetch profile row (role, username, email)
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role,username,email")
      .eq("id", userId)
      .single();

    let role = "staff";
    let username = email;
    if (profileErr) {
      // not fatal: if profile missing, default to staff
      console.warn("Profile missing:", profileErr);
    } else {
      role = profile.role || role;
      username = profile.username || profile.email || username;
    }

    // persist minimal session
    const sdUser = { id: userId, email, username, role };
    localStorage.setItem("sd_user", JSON.stringify(sdUser));

    // redirect to dashboard
    window.location.href = DASHBOARD_PAGE;

  } catch (err) {
    console.error("Login exception:", err);
    alert(err.message || "Login failed");
  }
});

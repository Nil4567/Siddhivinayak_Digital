// /pages/login.js

// Use the global Supabase client created in login.html
const supabase = window.supabaseClient;

// Dashboard redirect
const DASHBOARD_PAGE = "../pages/dashboard.html";

const form = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  errorMessage.textContent = ""; // clear old errors

  if (!email || !password) {
    errorMessage.textContent = "Please enter email and password.";
    return;
  }

  try {
    // Attempt login with Supabase Auth
    const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signErr) {
      errorMessage.textContent = signErr.message || "Invalid email or password.";
      return;
    }

    const userId = signData.user?.id;
    if (!userId) {
      errorMessage.textContent = "Login succeeded but user ID missing.";
      return;
    }

    // Fetch role from profiles table
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role, username, email")
      .eq("id", userId)
      .single();

    let role = "user";
    let username = email;

    if (!profileErr && profile) {
      role = profile.role || "user";
      username = profile.username || profile.email || email;
    }

    // Save session locally
    const sdUser = { id: userId, email, username, role };
    localStorage.setItem("sd_user", JSON.stringify(sdUser));

    // Redirect
    window.location.href = DASHBOARD_PAGE;

  } catch (err) {
    console.error("Login error:", err);
    errorMessage.textContent = err.message || "Login failed.";
  }
});

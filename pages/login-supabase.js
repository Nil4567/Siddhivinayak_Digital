// pages/login-supabase.js
import { supabase } from "./supabase-config.js";

const form = document.getElementById("loginForm");
const errEl = document.getElementById("loginError");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errEl.style.display = "none";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    // sign in
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // fetch profile from profiles table
    const user = data.user;
    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("id, email, username, role")
      .eq("id", user.id)
      .single();

    if (pErr) {
      // If profile missing, still allow logged-in user but role unknown
      localStorage.setItem("sd_user", JSON.stringify({ id: user.id, email: user.email, role: null }));
      window.location.href = "/Siddhivinayak_Digital/pages/dashboard.html";
      return;
    }

    // store session info (non-sensitive)
    localStorage.setItem("sd_user", JSON.stringify({ id: user.id, email: user.email, role: profiles.role, username: profiles.username }));
    // redirect based on role
    if (profiles.role === "superadmin") {
      window.location.href = "/Siddhivinayak_Digital/pages/dashboard.html";
    } else {
      window.location.href = "/Siddhivinayak_Digital/pages/dashboard.html";
    }
  } catch (err) {
    console.error("Login error:", err);
    errEl.textContent = err.message || "Login failed";
    errEl.style.display = "block";
  }
});

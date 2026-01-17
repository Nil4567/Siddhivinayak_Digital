// js/auth.js

// Make sure the Supabase SDK is loaded in your HTML BEFORE this file:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// <script src="js/auth.js"></script>

// Initialize Supabase client
const { createClient } = supabase;
const supabaseUrl = "https://qcyqjcxzytjtsikzrdyv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjeXFqY3h6eXRqdHNpa3pyZHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMzA4NjAsImV4cCI6MjA4MDgwNjg2MH0.q0gkhSgqT_BNfsZBCd2stkgskf2V-CDVIG9p6S5LHdM";
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Handle login
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        alert("Login failed: " + error.message);
        console.error("Login error:", error);
        return;
      }

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        alert("No user found after login.");
        return;
      }

      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        alert("Error fetching role: " + profileError.message);
        console.error("Profile error:", profileError);
        return;
      }

      if (profile?.role === "admin") {
        window.location.href = "admin-dashboard.html";
      } else {
        window.location.href = "user-home.html";
      }
    });
  }

  // Handle logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
      window.location.href = "index.html";
    });
  }
});

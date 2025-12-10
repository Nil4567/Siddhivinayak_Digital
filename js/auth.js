// Initialize Supabase
const supabaseClient = supabase.createClient("SUPABASE_URL", "SUPABASE_ANON_KEY");

// Login handler
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Login failed: " + error.message);
    return;
  }

  const role = data.user.user_metadata.role;
  if (role === "admin") {
    window.location.href = "admin-dashboard.html";
  } else {
    window.location.href = "user-home.html";
  }
});

// Role check function
async function checkRole(expectedRole, redirectPage) {
  const { data } = await supabaseClient.auth.getUser();
  const role = data.user?.user_metadata?.role;

  if (role !== expectedRole) {
    window.location.href = redirectPage;
  }
}

// Logout
function logout() {
  supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

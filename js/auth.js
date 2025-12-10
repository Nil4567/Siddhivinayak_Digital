// auth.js
// Supabase authentication + role-based redirect

// 1. Initialize Supabase client
const { createClient } = supabase;
const supabaseUrl = "https://YOUR-PROJECT-REF.supabase.co";   // replace with your Supabase project URL
const supabaseKey = "YOUR-ANON-KEY";                          // replace with your anon/public API key
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// 2. Handle login form submission
document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Sign in user
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    alert("Login failed: " + error.message);
    return;
  }

  // 3. Get logged-in user info
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    alert("No user found after login.");
    return;
  }

  const userId = user.id;

  // 4. Fetch role from profiles table
  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError) {
    alert("Error fetching role: " + profileError.message);
    return;
  }

  const role = profile?.role;

  // 5. Redirect based on role
  if (role === "admin") {
    window.location.href = "admin-dashboard.html";
  } else {
    window.location.href = "user-home.html";
  }
});

// 6. Handle logout
document.getElementById("logout-btn")?.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});

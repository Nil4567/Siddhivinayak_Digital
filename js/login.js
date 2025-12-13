async function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Login failed: " + error.message);
    return;
  }

  // Save UID + loggedIn flag
  localStorage.setItem("uid", data.user.id);
  localStorage.setItem("loggedIn", "yes");

  // Fetch role from profiles table
  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role, display_name")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    alert("User not found in database.");
    return;
  }

  // Save role in localStorage
  localStorage.setItem("role", profile.role);
  localStorage.setItem("display_name", profile.display_name || "");

  // Redirect based on role
  if (profile.role === "admin") {
    window.location.href = "admin-dashboard.html";
  } else {
    window.location.href = "user-home.html";
  }
}

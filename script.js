// -----------------------------
// USER DATABASE (Hardcoded because GitHub Pages cannot load JSON)
// -----------------------------
const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "staff", password: "staff123", role: "staff" }
];

// -----------------------------
// LOGIN FUNCTION
// -----------------------------
function login(event) {
  if (event) event.preventDefault();

  const uname = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  const found = users.find(u => u.username === uname && u.password === pass);

  if (!found) {
    alert("❌ Invalid username or password");
    return;
  }

  // Save login info
  localStorage.setItem("loggedUser", JSON.stringify(found));

  // Redirect to dashboard (correct path)
  window.location.href = "pages/dashboard.html";
}

// -----------------------------
// CHECK LOGIN BEFORE LOADING PAGES
// -----------------------------
function checkLogin() {
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  if (!user) {
    // go back to login page (correct path from /pages/)
    window.location.href = "../index.html";
  }
}

// -----------------------------
// LOGOUT FUNCTION
// -----------------------------
function logout() {
  localStorage.removeItem("loggedUser");
  window.location.href = "../index.html";
}

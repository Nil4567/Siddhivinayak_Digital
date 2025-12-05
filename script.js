// Simple hardcoded login credentials
const validUser = {
  username: "admin",
  password: "12345"
};

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  const error = document.getElementById("error");

  if (user === validUser.username && pass === validUser.password) {
    // Store login status
    localStorage.setItem("loggedIn", "yes");

    // Redirect to homepage
    window.location.href = "home.html";
  } else {
    error.textContent = "Invalid username or password!";
  }
}

// Redirect users who are not logged in
function checkLogin() {
  if (localStorage.getItem("loggedIn") !== "yes") {
    window.location.href = "index.html";
  }
}

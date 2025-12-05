// Login system using simple browser session
const DEFAULT_USER = "admin";
const DEFAULT_PASS = "admin123";

// Login button
function login() {
    const user = document.getElementById("username")?.value.trim();
    const pass = document.getElementById("password")?.value.trim();

    if (user === DEFAULT_USER && pass === DEFAULT_PASS) {
        sessionStorage.setItem("loggedIn", "true");
        window.location.href = "home.html";
    } else {
        alert("Invalid username or password");
    }
}

// Demo login
function demoLogin() {
    document.getElementById("username").value = DEFAULT_USER;
    document.getElementById("password").value = DEFAULT_PASS;
}

// Logout function
function logout() {
    sessionStorage.removeItem("loggedIn");
    window.location.href = "index.html";
}

// Protect pages
function checkLogin() {
    if (sessionStorage.getItem("loggedIn") !== "true") {
        alert("Please login first");
        window.location.href = "index.html";
    }
}

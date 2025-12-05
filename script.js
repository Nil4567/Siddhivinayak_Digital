// Simple login system
// Default admin credentials
const DEFAULT_USER = "admin";
const DEFAULT_PASS = "admin123";

// Login button
function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (user === DEFAULT_USER && pass === DEFAULT_PASS) {
        alert("Login successful!");
        window.location.href = "home.html"; // Next page
    } else {
        alert("Invalid username or password");
    }
}

// Demo login
function demoLogin() {
    document.getElementById("username").value = DEFAULT_USER;
    document.getElementById("password").value = DEFAULT_PASS;
}

// SIMPLE LOGIN (TEMPORARY)
// Username: admin
// Password: admin

function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (user === "admin" && pass === "admin") {
        window.location.href = "pages/dashboard.html";
    } else {
        alert("Invalid username or password");
    }
}

function demoLogin() {
    window.location.href = "pages/dashboard.html";
}

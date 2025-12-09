import { SCRIPT_URL, SECURITY_TOKEN, DASHBOARD_PAGE } from "/pages/config.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const status = document.getElementById("loginMessage");

    status.textContent = "Checking...";
    
    try {
        const url = `${SCRIPT_URL}?type=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&securityToken=${SECURITY_TOKEN}`;

        const res = await fetch(url);
        const json = await res.json();

        if (json.status === "success") {
            const role = json.data.role;

            if (role === "SuperAdmin") {
                alert("Welcome SuperAdmin!");
            }

            // Redirect to dashboard
            window.location.href = DASHBOARD_PAGE;
        } else {
            status.textContent = "❌ Invalid username or password";
        }
    } catch (err) {
        status.textContent = "❌ Network error";
    }
});

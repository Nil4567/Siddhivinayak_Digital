import { SCRIPT_URL, SECURITY_TOKEN, DASHBOARD_PAGE } from "./config.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    errorMsg.textContent = "";

    if (!username || !password) {
        errorMsg.textContent = "Please enter both username and password.";
        return;
    }

    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "login",
                username,
                password,
                token: SECURITY_TOKEN
            })
        });

        const result = await response.json();

        if (result.status === "success") {
            
            // Store user session
            localStorage.setItem("sd_username", result.username);
            localStorage.setItem("sd_role", result.role);  // superadmin / admin / user

            // Redirect
            window.location.href = DASHBOARD_PAGE;
        } 
        else {
            errorMsg.textContent = result.message || "Invalid credentials";
        }

    } catch (err) {
        console.error(err);
        errorMsg.textContent = "Network error — try again.";
    }
});

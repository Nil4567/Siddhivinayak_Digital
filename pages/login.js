import { SCRIPT_URL, SECURITY_TOKEN, DASHBOARD_PAGE } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        /***************************************
         * 🔥 SUPERADMIN ALWAYS ALLOWED
         ***************************************/
        if (username === "superadmin" && password === "admin123") {
            localStorage.setItem("loggedInUser", JSON.stringify({
                username: "superadmin",
                role: "SuperAdmin",
            }));

            alert("SuperAdmin Login Successful!");
            window.location.href = DASHBOARD_PAGE;
            return;
        }

        /***************************************
         * 🔥 NORMAL STAFF LOGIN
         ***************************************/
        try {
            const url =
                `${SCRIPT_URL}?type=login&securityToken=${SECURITY_TOKEN}` +
                `&username=${encodeURIComponent(username)}` +
                `&password=${encodeURIComponent(password)}`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.status === "success") {
                localStorage.setItem("loggedInUser", JSON.stringify({
                    username: data.data.username,
                    role: data.data.role
                }));
                window.location.href = DASHBOARD_PAGE;
            } else {
                alert(data.message || "Invalid login credentials");
            }

        } catch (error) {
            console.error(error);
            alert("Network error. Please try again.");
        }
    });
});

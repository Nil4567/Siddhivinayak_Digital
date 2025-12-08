/*******************************************************
 * ADD STAFF PAGE LOGIC
 *******************************************************/
import { SCRIPT_URL, SECURITY_TOKEN } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

    // Prevent unauthorized users
    if (!loggedUser) {
        alert("Login required!");
        window.location.href = "/Siddhivinayak_Digital/pages/login.html";
        return;
    }

    // Only SuperAdmin can add users
    if (loggedUser.role !== "SuperAdmin") {
        document.getElementById("onlySuperadmin").style.display = "block";
        document.getElementById("addUserForm").style.display = "none";
        return;
    }

    const form = document.getElementById("addUserForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("newUsername").value.trim();
        const password = document.getElementById("newPassword").value.trim();
        const role = document.getElementById("newRole").value.trim();

        if (!username || !password || !role) {
            alert("Please fill all fields.");
            return;
        }

        try {
            const url =
                `${SCRIPT_URL}?type=addUser` +
                `&securityToken=${SECURITY_TOKEN}` +
                `&username=${encodeURIComponent(username)}` +
                `&password=${encodeURIComponent(password)}` +
                `&role=${encodeURIComponent(role)}`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.status === "success") {
                alert("User added successfully!");
                window.location.href = "/Siddhivinayak_Digital/pages/user-management.html";
            } else {
                alert(data.message || "Failed to add user");
            }

        } catch (err) {
            console.error(err);
            alert("Network error. Try again.");
        }
    });
});

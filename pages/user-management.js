const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec";
const APP_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987";

// ------------------ Load Users ------------------
async function loadUsers() {
    try {
        const res = await fetch(`${SCRIPT_URL}?appToken=${APP_TOKEN}&dataType=USER_CREDENTIALS`);
        const json = await res.json();

        if (json.result !== "success") {
            alert("Error loading users: " + json.error);
            return;
        }

        const users = json.data;
        const tbody = document.getElementById("userTableBody");
        tbody.innerHTML = "";

        users.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
               <td>${user[0]}</td>
               <td>${user[2]}</td>
               <td>
                    <button onclick="deleteUser('${user[0]}')">Delete</button>
               </td>
            `;

            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("Error loading users:", err);
        alert("Failed to load users");
    }
}

// ------------------ Add User ------------------
async function saveUser() {
    const username = document.getElementById("newUsername").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const role = document.getElementById("newRole").value;

    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    const payload = {
        appToken: APP_TOKEN,
        dataType: "ADD_USER",
        data: {
            username: username,
            passwordHash: password,
            role: role
        }
    };

    try {
        const res = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" }
        });

        const json = await res.json();
        if (json.result !== "success") {
            alert("Error: " + json.error);
            return;
        }

        alert("User added!");
        closeAddUserModal();
        loadUsers();
    } catch (err) {
        console.error("Error adding user:", err);
    }
}

// ------------------ Delete User ------------------
async function deleteUser(username) {
    if (!confirm("Delete user " + username + "?")) return;

    const payload = {
        appToken: APP_TOKEN,
        dataType: "DELETE_USER",
        data: { username: username }
    };

    try {
        const res = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" }
        });

        const json = await res.json();
        if (json.result !== "success") {
            alert("Error: " + json.error);
            return;
        }

        alert("User deleted");
        loadUsers();
    } catch (err) {
        console.error("Error deleting user:", err);
    }
}

// ------------------ Modal Controls ------------------
function openAddUserModal() {
    document.getElementById("addUserModal").style.display = "block";
}

function closeAddUserModal() {
    document.getElementById("addUserModal").style.display = "none";
}

// Load users on page load
document.addEventListener("DOMContentLoaded", loadUsers);

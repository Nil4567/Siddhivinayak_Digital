const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec";

// ------------------ Load Users ------------------
async function loadUsers() {
    try {
        const res = await fetch(SCRIPT_URL + "?action=getUsers");
        const data = await res.json();

        const tbody = document.getElementById("userTableBody");
        tbody.innerHTML = "";

        data.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
               <td>${user.username}</td>
               <td>${user.role}</td>
               <td><button onclick="deleteUser('${user.username}')">Delete</button></td>
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

    const formData = new FormData();
    formData.append("action", "addUser");
    formData.append("username", username);
    formData.append("password", password);
    formData.append("role", role);

    try {
        const res = await fetch(SCRIPT_URL, { method: "POST", body: formData });
        const text = await res.text();
        alert(text);
        closeAddUserModal();
        loadUsers();
    } catch (err) {
        console.error("Error adding user:", err);
    }
}

// ------------------ Delete User ------------------
async function deleteUser(username) {
    if (!confirm("Delete user " + username + "?")) return;

    const formData = new FormData();
    formData.append("action", "deleteUser");
    formData.append("username", username);

    try {
        const res = await fetch(SCRIPT_URL, { method: "POST", body: formData });
        const text = await res.text();
        alert(text);
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

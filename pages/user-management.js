/*******************************************************
 * USER MANAGEMENT FRONTEND — FORM-DATA VERSION (NO PREFLIGHT)
 *******************************************************/

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzVcME3Xb95pDU8faZ1HhGGB1k5hYiBhSlx6GPFUcE2CbCtzO5_9Y3KLv12aoFF70M8sQ/exec";
const APP_TOKEN = "Siddhivi!n@yakD1gital-T0ken-987";

// ========================
// LOAD USERS
// ========================
function loadUsers() {
    fetch(`${SCRIPT_URL}?dataType=USER_CREDENTIALS&appToken=${APP_TOKEN}`)
        .then(res => res.json())
        .then(data => {
            if (data.result !== "success") {
                alert("Error loading users: " + data.error);
                return;
            }

            const users = data.data;
            const tbody = document.getElementById("userTableBody");
            tbody.innerHTML = "";

            users.forEach(row => {
                const [username, passwordHash, role] = row;

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${username}</td>
                    <td>${role}</td>
                    <td><button onclick="deleteUser('${username}')">Delete</button></td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => alert("Load error: " + err));
}

window.onload = loadUsers;

// ========================
// ADD USER
// ========================
function addUser() {
    const username = document.getElementById("newUsername").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const role = document.getElementById("newRole").value;

    if (!username || !password) {
        alert("Username & password required.");
        return;
    }

    const passwordHash = btoa(password); // simple encode

    const formData = new FormData();
    formData.append("appToken", APP_TOKEN);
    formData.append("dataType", "ADD_USER");
    formData.append("username", username);
    formData.append("passwordHash", passwordHash);
    formData.append("role", role);

    fetch(SCRIPT_URL, { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                alert("User added successfully");
                closeAddUserModal();
                loadUsers();
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(err => alert("Add error: " + err));
}

// ========================
// DELETE USER
// ========================
function deleteUser(username) {
    if (!confirm("Delete user: " + username + "?")) return;

    const formData = new FormData();
    formData.append("appToken", APP_TOKEN);
    formData.append("dataType", "DELETE_USER");
    formData.append("username", username);

    fetch(SCRIPT_URL, { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.result === "success") {
                loadUsers();
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(err => alert("Delete error: " + err));
}

// ========================
// MODAL CONTROL
// ========================
function openAddUserModal() {
    document.getElementById("addUserModal").style.display = "block";
}
function closeAddUserModal() {
    document.getElementById("addUserModal").style.display = "none";
}
